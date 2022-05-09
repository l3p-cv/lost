import json
import os
from datetime import datetime
from lost.db import model, access, state, dtype
from lost.logic.template import combine_arguments
from lost.logic import file_man
from lost.utils.dump import dump
import flask
from lost import settings

__author__ = "Gereon Reus"

############################ start ################################
#                                                                 #
###################################################################


def start(db_man, data, manager_id, group_id):
    # data = json.loads(data)
    # load template
    template = db_man.get_pipe_template(data['templateId'])
    # initialize pipe starter
    pipe_starter = PipeStarter(template, data, manager_id, group_id)
    # create general pipe and fill with info
    db_man.save_obj(pipe_starter.create_pipe())
    # create raw pipe elements and map the ids in pipe_starter.pe_map
    create_pe_raw_element(db_man, pipe_starter)
    # and certain elements
    patch_pe(db_man, pipe_starter)
    db_man.save_obj(pipe_starter.unlock_pipe())
    return pipe_starter.pipe.idx
    
def create_pe_raw_element(db_man, pipe_starter):
    for pe in pipe_starter.template_content['elements']:
        pipe_element = pipe_starter.create_pe_raw_element(pe['peN'])
        db_man.save_obj(pipe_element)
        pipe_starter.save_to_pe_map(pe['peN'], pipe_element)

def patch_pe(db_man, pipe_starter):
    for pe in pipe_starter.template_content['elements']:
        pe_n = pe['peN']
        if 'datasource' in pe:
            db_man.save_obj(pipe_starter.patch_pe_datasource(pe_n))
            db_man.save_obj(pipe_starter.create_datasource(pe_n))
            handle_result_links(db_man, pipe_starter, pe_n)
        elif 'script' in pe:
            script = db_man.get_script(name=pe['script']['name'])
            db_man.save_obj(pipe_starter.patch_pe_script(pe_n, script))
            handle_results(db_man, pipe_starter, pe_n)
        elif 'annoTask' in pe:
            db_man.save_obj(pipe_starter.patch_pe_anno_task(pe_n))
            anno_task = pipe_starter.create_anno_task(pe_n)
            db_man.save_obj(anno_task)
            for req_label_leaf in pipe_starter.create_required_label_leaves(pe_n, anno_task.idx):
                db_man.add(req_label_leaf)
            db_man.commit()
            handle_multiple_result_links(db_man, pipe_starter, pe_n)
        elif 'dataExport' in pe:
            db_man.save_obj(pipe_starter.patch_pe_data_export(pe_n))
            handle_multiple_result_links(db_man, pipe_starter, pe_n)
        elif 'visualOutput' in pe:
            db_man.save_obj(pipe_starter.patch_pe_visual_output(pe_n))
            handle_multiple_result_links(db_man, pipe_starter, pe_n)
        elif 'loop' in pe:
            db_man.save_obj(pipe_starter.patch_pe_loop(pe_n))
            db_man.save_obj(pipe_starter.create_loop(pe_n))
            handle_multiple_result_links(db_man, pipe_starter, pe_n)
def handle_results(db_man, pipe_starter, pe_n):
    for result in pipe_starter.create_results(pe_n):
        db_man.save_obj(result)
        handle_result_links(db_man, pipe_starter, pe_n, result.idx)
def handle_result_links(db_man, pipe_starter, pe_n, result_id=None):
    for result_link in pipe_starter.create_result_links(pe_n, result_id):
                db_man.add(result_link)
    db_man.commit()
def handle_multiple_result_links(db_man, pipe_starter, pe_n):
    pe_id = pipe_starter.get_pe_id(pe_n)
    existing_result_links = db_man.get_resultlinks_pe_out(pe_id)
    for result_link in existing_result_links:
        handle_result_links(db_man, pipe_starter, pe_n, result_link.result_id)

class PipeStarter(object):
    def __init__(self, template, data, manager_id, group_id):
        self.pipe = model.Pipe()
        self.data_map = dict()
        self.pe_map = dict()
        self.template_map = dict()
        self.template = template
        self.data = data
        self.manager_id = manager_id
        self.group_id = group_id
        self.timestamp_now = datetime.now()
        self.template_content = json.loads(template.json_template)
        for element in self.template_content['elements']:
            self.template_map[element['peN']] = element
        for element in self.data['elements']:
            self.data_map[element['peN']] = element
    def create_pipe(self):
        try: 
            is_debug_mode = self.data['isDebug']
        except KeyError:
            is_debug_mode = False
        pipe = model.Pipe(name=self.data['name'],
                        pipe_template_id=self.template.idx,
                        state=state.Pipe.PENDING,
                        is_locked=True,
                        description=self.data['description'],
                        manager_id=self.manager_id,
                        is_debug_mode=is_debug_mode,
                        group_id=self.group_id,
                        timestamp=self.timestamp_now,
                        start_definition = json.dumps(self.data)
                        )
        self.pipe = pipe
        return pipe
    def create_pe_raw_element(self, pe_n):
        t_element = self.template_map[pe_n]
        pipe_element = model.PipeElement(state=state.PipeElement.PENDING,
                                        pipe_id=self.pipe.idx,
                                        is_debug_mode=False)
        return pipe_element

    def save_to_pe_map(self, pe_n, pipe_element):

        self.pe_map[pe_n] = pipe_element
    

    def patch_pe_datasource(self, pe_n):
        pipe_element = self.pe_map.get(pe_n)
        pipe_element.dtype = dtype.PipeElement.DATASOURCE
        return pipe_element
    def patch_pe_script(self, pe_n, script):
        pipe_element = self.pe_map.get(pe_n)
        template_element = self.template_map.get(pe_n)
        data_element = self.data_map.get(pe_n)
        pipe_element.dtype = dtype.PipeElement.SCRIPT
        pipe_element.script_id = script.idx
        if data_element['script']['isDebug'] is not None:
            pipe_element.is_debug_mode = data_element['script']['isDebug']
        try:
            final_args = combine_arguments(data_element, script)
            pipe_element.arguments = json.dumps(final_args)
        except KeyError:
            print("No arguments given for script")
        return pipe_element
    def patch_pe_anno_task(self, pe_n):
        pipe_element = self.pe_map.get(pe_n)
        pipe_element.dtype = dtype.PipeElement.ANNO_TASK
        return pipe_element
    def patch_pe_data_export(self, pe_n):
        pipe_element = self.pe_map.get(pe_n)
        pipe_element.dtype = dtype.PipeElement.DATA_EXPORT
        return pipe_element
    def patch_pe_visual_output(self, pe_n):
        pipe_element = self.pe_map.get(pe_n)
        pipe_element.dtype = dtype.PipeElement.VISUALIZATION
        return pipe_element
    def patch_pe_loop(self, pe_n):
        pipe_element = self.pe_map.get(pe_n)
        pipe_element.dtype = dtype.PipeElement.LOOP
        return pipe_element
    def create_datasource(self, pe_n):
        template_element = self.template_map.get(pe_n)
        data_element = self.data_map.get(pe_n)
        pe_id = self.pe_map.get(pe_n).idx
        datasource = model.Datasource()
        datasource.pipe_element_id = pe_id
        datasource.selected_path = data_element['datasource']['selectedPath']
        datasource.fs_id = data_element['datasource']['fs_id']
        # if template_element['datasource']['type'] == 'dataset':
        #     datasource.dtype = dtype.Datasource.DATASET
        #     datasource.dataset_id = data_element['datasource']['datasetId']
        # elif template_element['datasource']['type'] == 'modelLeaf':
        #     datasource.dtype = dtype.Datasource.MODEL_LEAF
        #     datasource.model_leaf_id = data_element['datasource']['modelLeafId']
        # elif template_element['datasource']['type'] == 'rawFile':
        #     datasource.dtype = dtype.Datasource.RAW_FILE
        #     datasource.raw_file_path = os.path.join(file_man.MEDIA_ROOT_PATH, data_element['datasource']['rawFilePath'])
        # elif template_element['datasource']['type'] == 'pipeElement':
        #     datasource.dtype = dtype.Datasource.PIPE_ELEMENT
        #     datasource.pipe_element_id = data_element['datasource']['pipeElementId']
        return datasource

    def create_anno_task(self, pe_n):
        template_element = self.template_map.get(pe_n)
        data_element = self.data_map.get(pe_n)
        pe_id = self.pe_map.get(pe_n).idx
        anno_task = model.AnnoTask()
       # anno_task.manager_id = self.manager_id
        anno_task.pipe_element_id = pe_id
        if template_element['annoTask']['type'].lower() == "mia":
            anno_task.dtype = dtype.AnnoTask.MIA
        elif template_element['annoTask']['type'].lower() == "sia":
            anno_task.dtype = dtype.AnnoTask.SIA
        anno_task.configuration = json.dumps(data_element['annoTask']['configuration'])
        anno_task.name = data_element['annoTask']['name']
        anno_task.instructions = data_element['annoTask']['instructions']
        anno_task.group_id = data_element['annoTask']['workerId']
        anno_task.timestamp = datetime.now()
        if data_element['annoTask']['workerId'] == -1:
            anno_task.group_id = None
        anno_task.state = state.AnnoTask.PENDING
        return anno_task
    def create_required_label_leaves(self, pe_n, anno_task_id):
        template_element = self.template_map.get(pe_n)
        data_element = self.data_map.get(pe_n)
        pe_id = self.pe_map.get(pe_n).idx
        required_label_leaves = list()
        for label_leaf in data_element['annoTask']['labelLeaves']:
            required_label_leaf = model.RequiredLabelLeaf()
            required_label_leaf.anno_task_id = anno_task_id
            required_label_leaf.label_leaf_id = label_leaf['id']
            required_label_leaf.max_labels = label_leaf['maxLabels']
            required_label_leaves.append(required_label_leaf)
        return required_label_leaves
    def create_loop(self, pe_n):
        template_element = self.template_map.get(pe_n)
        data_element = self.data_map.get(pe_n)
        pe_jump_id = self.pe_map.get(template_element['loop']['peJumpId']).idx
        pe_id = self.pe_map.get(pe_n).idx
        loop = model.Loop()
        loop.iteration = 0
        loop.isBreakLoop = False
        loop.max_iteration = data_element['loop']['maxIteration']
        loop.pe_jump_id = pe_jump_id
        loop.pipe_element_id = pe_id
        return loop

    def create_results(self, pe_n):
        pe_out = self.template_map.get(pe_n)['peOut']
        results = list()
        if pe_out:
            for out in pe_out:
                result = model.Result(timestamp=self.timestamp_now)
                results.append(result)
        return results
    def create_result_links(self, pe_n, result_id=None):
        pe_outs = self.template_map.get(pe_n)['peOut']
        result_links = list()
        if pe_outs:
            for pe_out in pe_outs:
                result_link = model.ResultLink(result_id=result_id,
                                            pe_n=self.pe_map.get(pe_n).idx,
                                            pe_out=self.pe_map.get(pe_out).idx)
                result_links.append(result_link)
        # if last element in pipeline - create one last 
        # result link without pe_out
        else: 
            result_link = model.ResultLink(result_id=None,
                                        pe_n=self.pe_map.get(pe_n).idx)
            result_links.append(result_link)
        return result_links
    def unlock_pipe(self):
        self.pipe.is_locked = False
        return self.pipe

    def get_pe_id(self, pe_n):
        return self.pe_map.get(pe_n).idx
############################ get_running_pipes ####################
#                                                                 #
###################################################################
def get_pipelines(db_man, group_ids, debug_mode=False):
    '''Read out all pipelines dependent on debug_mode.

    Args:
        db_man:
        group_ids: Group ids to search for
        debug_mode (Boolean): Weather to load Pipes in debug or normal
    
    Returns: 
        JSON with all meta info about the pipelines.
    '''
    
    # dump(group_ids, "--- printing group_ids ---")
    pipes = db_man.get_pipes(group_ids)
    result = __serialize_pipes(db_man, debug_mode, pipes)
    return result
############################ get_completed_pipes ##################
#                                                                 #
###################################################################
def __serialize_pipes(db_man, debug_mode, pipes):
    pipes_json = dict()
    pipes_json["pipes"] = list()
    for pipe in pipes:
        # filter pipes with debug mode
        if debug_mode:
            if not pipe.is_debug_mode:
                continue
        else:
            if pipe.is_debug_mode:
                continue
        progress = calculate_progress(db_man, pipe.idx)
        creator_name = "Unknown"
        if pipe.manager_id:
            creator_name = pipe.group.name 
        if pipe.state == state.Pipe.ERROR:
            progress = "ERROR"
        if pipe.state == state.Pipe.PAUSED:
            progress = "PAUSED"
        pipe_json = {'id': pipe.idx,
                     'name': pipe.name,
                     'description': pipe.description,
                     'date': pipe.timestamp.strftime(settings.STRF_TIME),
                     'progress': progress,
                     'creatorName': creator_name,
                     'isDebug': pipe.is_debug_mode,
                     'logfilePath': pipe.logfile_path,
                     'templateName': __get_template_name(db_man, pipe.pipe_template_id)
                     }
        pipes_json['pipes'].append(pipe_json)
    return pipes_json

def __get_template_name(db_man, template_id):
    template = db_man.get_pipe_template(template_id)
    return json.loads(template.json_template)['name']

############################ get_running_pipe #####################
#                                                                 #
###################################################################
def get_running_pipe(db_man, identity, pipe_id, media_url):
    ''' read out a single running pipe

    Args:
        db_man:
        pipe_id: the id of the requested pipe
        media_url: prefix of media path
        
    Returns:
        json content of running pipe
    '''
    # self.logger.info('This is A test Message: {}'.format("HEy ho"))
    pipe = db_man.get_pipe(pipe_id)
    if pipe is None: #or pipe.state == state.Pipe.FINISHED
        error_msg = "Pipe with ID '"+ str(pipe_id) + "' does not exist."
        try:
            raise PipeNotFoundError(error_msg)
        finally:
            return error_msg

    pipe_manager_name = pipe.manager.first_name + " " + pipe.manager.last_name
    pipe_serialize = PipeSerialize(media_url)
    # add global meta info about pipe
    progress = calculate_progress(db_man, pipe.idx)
    if pipe.state == state.Pipe.ERROR:
        progress = "ERROR"
    if pipe.state == state.Pipe.PAUSED:
        progress = "PAUSED"
    pipe_serialize.add_global_info(pipe, pipe_manager_name, progress)
    # add certain elements with info
    serialize_elements(db_man, pipe_serialize, pipe.idx)
    return pipe_serialize.pipe_json

def serialize_elements(db_man, pipe_serialize, pipe_id):
    for pe in db_man.get_pipe_elements(pipe_id):
        # dependent on dtype fill json with relevant information
        ########## DATASOURCE #############
        if pe.dtype == dtype.PipeElement.DATASOURCE:
            datasource = db_man.get_datasource(pipe_element_id=pe.idx)
            pipe_serialize.add_datasource(pe, datasource)
        ########## SCRIPT #############
        elif pe.dtype == dtype.PipeElement.SCRIPT:
            pipe_serialize.add_script(pe)
        ########## ANNO_TASK #############
        elif pe.dtype == dtype.PipeElement.ANNO_TASK:
            anno_task = db_man.get_anno_task(pipe_element_id=pe.idx)
            # TODO: if all_users - will throw an error at this time
            for r in db_man.count_all_image_annos(anno_task_id=anno_task.idx)[0]:
                img_count = r
            for r in db_man.count_image_remaining_annos(anno_task_id=anno_task.idx):
                annotated_img_count = img_count - r
            anno_task_user_name = "All Users"
            if anno_task.group_id:
                anno_task_user_name = anno_task.group.name
            leaves = db_man.get_all_required_label_leaves(anno_task.idx)
            pipe_serialize.add_anno_task(pe, anno_task, anno_task_user_name, leaves, img_count, annotated_img_count)
        
        ########## DATA EXPORT #############
        elif pe.dtype == dtype.PipeElement.DATA_EXPORT:
            data_exports = list()
            for rl in db_man.get_resultlinks_pe_out(pe_out_id=pe.idx):
                for de in db_man.get_data_exports(result_id = rl.result_id):
                    data_exports.append(de)
            pipe_serialize.add_data_export(pe, data_exports)
        
        ########## VISUALIZATION #############
        elif pe.dtype == dtype.PipeElement.VISUALIZATION:
            visual_outputs = list()
            for rl in db_man.get_resultlinks_pe_out(pe_out_id=pe.idx):
                for vs in db_man.get_visual_outputs(result_id = rl.result_id):
                    visual_outputs.append(vs)
            pipe_serialize.add_visual_output(pe, visual_outputs)
        ########## LOOP #############
        elif pe.dtype == dtype.PipeElement.LOOP:
            pipe_serialize.add_loop(pe)



class PipeSerialize(object):
    def __init__(self, media_url=None):
        self.media_url = media_url
        self.pipe_json = dict()
        self.pipe_json['elements'] = list()
        
    def add_global_info(self, pipe, manager_name, progress):
        self.pipe_json['id'] = pipe.idx
        self.pipe_json['name'] = pipe.name
        self.pipe_json['description'] = pipe.description
        self.pipe_json['managerName'] = manager_name
        self.pipe_json['templateId'] = pipe.pipe_template_id
        self.pipe_json['timestamp'] = pipe.timestamp.strftime(settings.STRF_TIME)
        self.pipe_json['isDebug'] = pipe.is_debug_mode
        self.pipe_json['logfilePath'] = pipe.logfile_path
        self.pipe_json['progress'] = progress
        self.pipe_json['startDefinition'] = json.loads(pipe.start_definition)

    def append_pe_json(self, pe_json):
        self.pipe_json['elements'].append(pe_json)
        
    def add_pe_info(self, pe, pe_json):
        pe_json['id'] = pe.idx
        pe_json['peN'] = pe.idx
        pe_json['peOut'] = list()
        # get all output elements of element
        for rlink in pe.pe_outs:
            pe_json['peOut'].append(rlink.idx)
        # dependent on state set string
        if pe.state == state.PipeElement.PENDING:
            pe_json['state'] = "pending"
        elif pe.state == state.PipeElement.IN_PROGRESS:
            pe_json['state'] = "in_progress"
        elif pe.state == state.PipeElement.FINISHED:
            pe_json['state'] = "finished"
        elif pe.state == state.PipeElement.SCRIPT_ERROR:
            pe_json['state'] = "script_error"
        return pe_json


    def add_datasource(self, pe, datasource):
        # create pipe element json
        pe_json = dict()
        # fill with pipe element global info
        pe_json = self.add_pe_info(pe, pe_json)
        # create datasource json
        datasource_json = dict()
        # fill datasource with info
        # dump(datasource, "--- dump ---") 
        datasource_json['id'] = datasource.idx
        datasource_json['rawFilePath'] = datasource.selected_path

        # if datasource.dtype == dtype.Datasource.DATASET:
        #     datasource_json['type'] = "dataset"
        #     datasource_json['dataset'] = self.__ds_dataset(datasource.dataset)
        # elif datasource.dtype == dtype.Datasource.MODEL_LEAF:
        #     datasource_json['type'] = "modelLeaf"
        #     datasource_json['modelLeaf'] = self.__ds_model_leaf(datasource.model_leaf)
        # elif datasource.dtype == dtype.Datasource.RAW_FILE:
        #     datasource_json['type'] = "rawFile"
        #     datasource_json['rawFilePath'] = datasource.selected_path
        # elif datasource.dtype == dtype.Datasource.PIPE_ELEMENT:
        #     datasource_json['type'] = "pipeElement"
        #     datasource_json['pipeElement'] = self.__ds_dataset(datasource.pipe_element_id)

        pe_json['datasource'] = datasource_json
        self.append_pe_json(pe_json)

    def __ds_dataset(self, dataset):
        dataset_json = dict()
        dataset_json['id'] = dataset.idx
        dataset_json['name'] = dataset.name
        dataset_json['description'] = dataset.description
        return dataset_json
    def __ds_model_leaf(self, model_leaf):
        model_leaf_json = dict()
        model_leaf_json['id'] = model_leaf.idx
        model_leaf_json['name'] = model_leaf.name
        model_leaf_json['description'] = model_leaf.description
        model_leaf_json['framework'] = model_leaf.framework
        model_leaf_json['architecture'] = model_leaf.architecture
        model_leaf_json['parentId'] = model_leaf.parent_id
        # TODO: ORM relationship to model tree
        model_leaf_json['modelTreeName'] = model_leaf.model_tree.name
        return model_leaf_json
    def __ds_pipe_element(self, pipe_element_id):
        pipe_element_json = dict()
        pipe_element_json['id'] = pipe_element_id
        return pipe_element_json
    

    def add_script(self, pe):
        script = pe.script
        # create pipe element json
        pe_json = dict()
        # fill with pipe element global info
        pe_json = self.add_pe_info(pe, pe_json)
        script_json = dict()
        script_json['id'] = script.idx
        script_json['isDebug'] = pe.is_debug_mode
        script_json['debugSession'] = pe.debug_session
        script_json['name'] = script.name
        script_json['description'] = script.description
        script_json['path'] = script.path
        # * language was not defined in any pipeline definition file i looked at.
        # if hasattr(script, 'language'): 
        #     if script.language == dtype.ScriptLanguage.PYTHON2:
        #         script_json['language'] = "python2"
        #     elif script.language == dtype.ScriptLanguage.PYTHON3:
        #         script_json['language'] = "python3"
        script_json['arguments'] = None
        if pe.arguments:
            script_json['arguments'] = json.loads(pe.arguments)
        # TODO: envs
        script_json['envs'] = script.envs
        script_json['progress'] = pe.progress
        script_json['errorMsg'] = pe.error_msg
        script_json['warningMsg'] = pe.warning_msg
        script_json['logMsg'] = pe.log_msg
        pe_json['script'] = script_json
        self.append_pe_json(pe_json)

    def add_anno_task(self, pe, anno_task, anno_task_user_name, req_leaves, img_count, annotated_img_count):

        # create pipe element json
        pe_json = dict()
        # fill with pipe element global info
        pe_json = self.add_pe_info(pe, pe_json)
        
        anno_task_json = dict()
        anno_task_json['id'] = anno_task.idx
        anno_task_json['name'] = anno_task.name
        if anno_task.dtype == dtype.AnnoTask.MIA:
            anno_task_json['type'] = "mia"
        elif anno_task.dtype == dtype.AnnoTask.SIA:
            anno_task_json['type'] = "sia"
        anno_task_json['userName'] = anno_task_user_name
        anno_task_json['progress'] = anno_task.progress
        anno_task_json['imgCount'] = img_count
        anno_task_json['annotatedImgCount'] = annotated_img_count
        anno_task_json['instructions'] = anno_task.instructions
        if anno_task.configuration:
            anno_task_json['configuration'] = json.loads(anno_task.configuration)
        anno_task_json['labelLeaves'] = list()
        for req_leaf in req_leaves:
            leaf = req_leaf.label_leaf
            leaf_json = dict()
            leaf_json['id'] = leaf.idx
            leaf_json['name'] = leaf.name
            leaf_json['color'] = leaf.color
            anno_task_json['labelLeaves'].append(leaf_json)
        pe_json['annoTask'] = anno_task_json
        self.append_pe_json(pe_json)

    def add_data_export(self, pe, data_exports):
        # create pipe element json
        pe_json = dict()
        # fill with pipe element global info
        pe_json = self.add_pe_info(pe, pe_json)
        data_exports_json = list()
        for de in data_exports:
            data_export_json = dict()
            data_export_json['id'] = de.idx
            data_export_json['iteration'] = de.iteration
            data_export_json['file_path'] = de.file_path
            data_export_json['result_id'] = de.result_id
            data_export_json['fs_id'] = de.fs_id
            # raise Exception('Test {}'.format(de.fs_id))
            data_exports_json.append(data_export_json)
        pe_json['dataExport'] = data_exports_json
        self.append_pe_json(pe_json)

    def add_visual_output(self, pe, visual_outputs):
        # create pipe element json
        pe_json = dict()
        # fill with pipe element global info
        pe_json = self.add_pe_info(pe, pe_json)
        visual_outputs_json = list()
        for vs in visual_outputs:
            visual_output_json = dict()
            visual_output_json['id'] = vs.idx
            visual_output_json['iteration'] = vs.iteration
            visual_output_json['imagePath'] = vs.img_path
            visual_output_json['htmlOutput'] = vs.html_string
            visual_outputs_json.append(visual_output_json)
        pe_json['visualOutput'] = visual_outputs_json
        self.append_pe_json(pe_json)

    def add_loop(self, pe):
        # create pipe element json
        pe_json = dict()
        # fill with pipe element global info
        pe_json = self.add_pe_info(pe, pe_json)
        loop_json = dict()
        loop = pe.loop
        loop_json['id'] = loop.idx
        loop_json['maxIteration'] = loop.max_iteration
        loop_json['iteration'] = loop.iteration
        loop_json['isBreakLoop'] = loop.break_loop
        loop_json['peJumpId'] = loop.pe_jump_id
        pe_json['loop'] = loop_json
        self.append_pe_json(pe_json)

############################ get_completed_pipe ###################
#                                                                 #
###################################################################
def get_completed_pipe(db_man, pipe_id, media_url):
    return get_running_pipe(db_man, pipe_id, media_url, False)
############################ delete ###############################
#                                                                 #
###################################################################
def delete(db_man, pipe_id):
    pipe_godfather = PipeGodfather(db_man, pipe_id)
    pipe_godfather.delete()
    return True
class PipeGodfather(object):
    ''' contains every dependent elements with foreign keys in db
    '''
    def __init__(self, db_man, pipe_id):
        self.db_man = db_man
        self.result_links = list()
        self.visual_outputs = list()
        self.data_exports = list()
        self.datasources = list()
        self.loops = list()
        self.two_d_annotations = list()
        self.image_annotations = list()
        self.results = list()
        self.required_label_leaves = list()
        self.choosen_anno_tasks = list()
        self.anno_tasks = list()
        self.pipe = self.db_man.get_pipe(pipe_id=pipe_id)
        self.pipe_elements = self.db_man.get_pipe_elements(pipe_id=pipe_id)
        self.file_man = file_man.FileMan(db_man.lostconfig)

        # Stop pipeline - so cron won't touch it.
        self.pipe.state = state.Pipe.DELETED 
        db_man.save_obj(self.pipe)

        for pe in self.pipe_elements:
            anno_task = self.db_man.get_anno_task(pipe_element_id=pe.idx)
            if anno_task:
                self.anno_tasks.append(anno_task)
            for result_link in self.db_man.get_resultlinks_pe_n(pe_n_id=pe.idx):
                if result_link not in self.result_links:
                    self.result_links.append(result_link)
                if result_link.result not in self.results:
                    if result_link.result:
                        self.results.append(result_link.result)
            loop = self.db_man.get_loop(pipe_element_id=pe.idx)
            if loop:
                self.loops.append(loop)
            datasource = self.db_man.get_datasource(pipe_element_id=pe.idx)
            if datasource:
                self.datasources.append(datasource)
        for anno_task in self.anno_tasks:
            
            for ch_anno_task in self.db_man.get_choosen_annotask(anno_task_id=anno_task.idx):
                self.choosen_anno_tasks.append(ch_anno_task)
            
            for leaf in self.db_man.get_all_required_label_leaves(anno_task_id=anno_task.idx):
                self.required_label_leaves.append(leaf)

            for image_annotation in self.db_man.get_image_annotations(anno_task_id=anno_task.idx):
                self.image_annotations.append(image_annotation)
                for two_d_anno in self.db_man.get_two_d_annotations(img_anno_id=image_annotation.idx):
                    self.two_d_annotations.append(two_d_anno)
        for result in self.results:
            for data_export in self.db_man.get_data_exports(result_id=result.idx):
                self.data_exports.append(data_export)
            for visual_output in self.db_man.get_visual_outputs(result_id=result.idx):
              self.visual_outputs.append(visual_output)
            
    def delete(self):
        ''' delete a pipe with all certain elements
        Todo: Cleanup filesystem
        '''
        for result_link in self.result_links:
            self.db_man.delete(result_link)
            self.db_man.commit()
        for visual_outputs in self.visual_outputs:
            self.db_man.delete(visual_outputs)
            self.db_man.commit()
        for data_export in self.data_exports:
            self.db_man.delete(data_export)
            self.db_man.commit()
        for datasource in self.datasources:
            self.db_man.delete(datasource)
            self.db_man.commit()
        for loop in self.loops:
            self.db_man.delete(loop)
            self.db_man.commit()
        for two_d_annotation in self.two_d_annotations:
            self.db_man.delete(two_d_annotation)
            self.db_man.commit()
        for image_annotation in self.image_annotations:
            self.db_man.delete(image_annotation)
            self.db_man.commit()
        for result in self.results:
            self.db_man.delete(result)
            self.db_man.commit()
        for required_label_leaf in self.required_label_leaves:
            self.db_man.delete(required_label_leaf)
            self.db_man.commit()
        for choosen_anno_task in self.choosen_anno_tasks:
            self.db_man.delete(choosen_anno_task)
            self.db_man.commit()
        for anno_task in self.anno_tasks:
            if anno_task.dtype == dtype.AnnoTask.MIA:
                self.file_man.rm_mia_crop_path(anno_task.idx)
            else:
                self.file_man.rm_sia_history_path(anno_task)
            self.db_man.delete(anno_task)
            self.db_man.commit()
        for pipe_element in self.pipe_elements:
            if pipe_element.dtype == dtype.PipeElement.SCRIPT:
                self.file_man.rm_instance_path(pipe_element)
            self.db_man.delete(pipe_element)
            self.db_man.commit()
        self.file_man.rm_pipe_context_path(self.pipe)
        self.file_man.rm_pipe_log_path(self.pipe)
        self.db_man.delete(self.pipe)
        self.db_man.commit()

def pause(db_man, pipe_id):
    ''' pause a pipe. 
    '''
    if pipe_id is not None:
        pipe = db_man.get_pipe(pipe_id=pipe_id)
        if pipe is not None:
            if pipe.state != state.Pipe.FINISHED and pipe.state != state.Pipe.ERROR \
            and  pipe.state != state.Pipe.PAUSED and pipe.state != state.Pipe.PENDING:
                pipe.state = state.Pipe.PAUSED
                db_man.save_obj(pipe)
                return "success"
    return "error"

def updateArguments(db_man, data):
    '''Update Arguments
    '''
    data = json.loads(data)
    if data['elementId'] is not None:
        element = db_man.get_pipe_element(pipe_e_id=data['elementId'])
        element.arguments = json.dumps(data['updatedArguments'])
        db_man.save_obj(element)
        if element is not None:
            return "success"
    return "error"

def play(db_man, pipe_id):
    ''' play a pipe. 
    '''
    if pipe_id is not None:
        pipe = db_man.get_pipe(pipe_id=pipe_id)
        if pipe is not None:
            if pipe.state != state.Pipe.FINISHED and pipe.state != state.Pipe.PENDING:
                pipe.state = state.Pipe.IN_PROGRESS
                db_man.save_obj(pipe) 
                return "success"
    return "error"
############################ utils ################################
#                                                                 #
###################################################################
def calculate_progress(db_man, pipe_id):
    ''' Calculate the progress of a given pipe.

    Args: 
        db_man:
        pipe_id: ID of Pipe which progress should be caluclated
    Returns:
        string representing the progress in percent.
    '''
    progress = 0 
    finished = 0
    elements = db_man.get_pipe_elements(pipe_id)
    for element in elements:
        if element.state == state.PipeElement.FINISHED:
            finished += 1
    progress = str(int(100*(finished/len(elements)))) + "%"
    return progress
class PipeNotFoundError(Exception):
    """ Base class for PipeNotFoundError
    """
    pass
