from datetime import date, datetime
from zipfile import ZipFile
import json
import logging
import os
import shutil
from lost.logic.file_man import AppFileMan
from lost.db import model
from lost.logic.script import get_default_script_arguments
from lost.logic.script import get_default_script_envs
from lost.logic.script import get_default_script_resources
from lost.logic.script import get_script_args
from glob import glob
from lost.logic import script as script_man
import copy

def parse_script(element):
    '''Parese a script element in json string.

    Args:
        element (dict): The script element to parse.

    Returns:
        object: :class:`lost.db.model.Script`
    '''
    script = model.Script(name=element['name'],
                        path=element['path'],
                        description=element['description'])
    return script

def _dump_extra_packages(extra_pip, extra_conda):
    return json.dumps({'pip': extra_pip, 'conda': extra_conda})

class PipeImporter(object):

    def __init__(self, pipe_template_dir, dbm, user_id=None, forTest=False):
        '''Load json file.

        Args:
            pipe_template_dir: Path to pipeline directory
        '''
        self.forTest = forTest
        self.dbm = dbm
        self.user_id = user_id
        self.file_man = AppFileMan(self.dbm.lostconfig)
        pt_dir = find_pipe_root_path(pipe_template_dir)
        self.install_path = pipe_template_dir
        if pt_dir.endswith('/'):
            pt_dir = pt_dir[:-1]
        self.src_pipe_template_path = pt_dir
        self.dst_pipe_template_path = os.path.join(self.file_man.pipe_path,
            os.path.basename(self.src_pipe_template_path))
        self.json_files = glob(os.path.join(pt_dir,'*.json'))
        self.pipes = []
        self.namespace = self._get_namespace()
        for json_path in self.json_files:
            with open(json_path) as jfile:
                try:
                    pipe = json.load(jfile)
                except:
                    raise JSONDecodeError()
            pipe['namespace'] = self.namespace
            pipe['name'] = self._namespaced_name(
                os.path.splitext(os.path.basename(json_path))[0]
            )
            self.pipes.append(pipe)
            # Set name to name of the script file
            for pe in pipe['elements']:
                if 'script' in pe:
                    pe['script']['name'] = self._namespaced_name(
                        pe['script']['path'])
        self.checker = PipeDefChecker(logging)

    def _get_namespace(self):
        name_space = os.path.basename(self.src_pipe_template_path).strip('/')
        if self.user_id is not None:
            name_space = f'{self.user_id}_{name_space}'
        return name_space

    def _namespaced_name(self, name):
        return '{}.{}'.format(self.namespace, name)

    def _get_script_name(self, script):
        return self._namespaced_name(os.path.basename(script.path))

    def start_import(self):
        logging.info('\n\n++++++++++++++++++++++ \n\n')
        logging.info('Start pipe project import for: {}'.format(self.src_pipe_template_path))
        error_message = ''
        for pipe in self.pipes:
            if not self.checker.check(pipe):
                message = 'Wrong pipeline definition! Did not import pipe project!'
                logging.error(message)
                error_message += message + "\n"
                return error_message
        # if os.path.exists(self.dst_pipe_template_path):
        #     logging.warning('Cannot import pipeline!')
        #     logging.warning('Pipe Template Dir already exist: {}'.format(
        #         self.dst_pipe_template_path
        #     ))
        #     return
        # dir_util.copy_tree(self.src_pipe_template_path, self.dst_pipe_template_path)
        # logging.info("Copyed pipeline template dir from %s to %s"%(self.src_pipe_template_path,
        #                                             self.dst_pipe_template_path))
        for pipe in self.pipes:
            message = self.import_pipe(pipe)
            if message != '':
                error_message += message + "\n"

        return error_message

    def import_pipe(self, pipe):
        error_message = ''
        try:
            logging.info('\n---\n')
            # Do everything relative from pipeline definition file path.
            oldwd = os.getcwd()
            os.chdir(self.src_pipe_template_path)
            # for db_pipe in self.dbm.get_all_pipeline_templates():
            #     db_json = json.loads(db_pipe.json_template)
                # if db_json['name'].lower() == pipe['name'].lower():
                #     logging.warning("PipeTemplate in database.")
                #     logging.warning("Name of this template is: %s"%(pipe['name'],))
                #     logging.warning("Will not import PipeTemplate.")
                #     return db_pipe.idx
            for pe_j in pipe['elements']:
                if 'script' in pe_j:
                    element_j = pe_j['script']
                    script = parse_script(element_j)
                    db_script = self.dbm.get_script(name=self._get_script_name(script))
                    script_arguments = get_default_script_arguments(script.path)
                    script_envs = get_default_script_envs(script.path)
                    script_resources = get_default_script_resources(script.path)
                    extra_pip = get_script_args(script.path, 'EXTRA_PIP', to_lower=False)
                    extra_pip = ' '.join(extra_pip)
                    if extra_pip is None: extra_pip=''
                    extra_conda = get_script_args(script.path, 'EXTRA_CONDA', to_lower=False)
                    extra_conda = ' '.join(extra_conda)
                    if extra_conda is None: extra_conda=''
                    if 'arguments' in element_j:
                        for arg in element_j['arguments']:
                            if arg not in script_arguments:
                                message = "Invalid argument >> {} << in pipeline definition json".format(arg)
                                logging.error(message)
                                valid_args = ""
                                error_message += message + "\n"
                                for v_arg in script_arguments:
                                    valid_args += ">> {} <<\n".format(v_arg)
                                message = "Valid arguments are: \n{}".format(valid_args[:-1])
                                logging.error(message)
                                error_message += message + "\n"
                                raise Exception('Invalid arguments. Start Cleanup')
                    if db_script is None:
                        self.dbm.add(script)
                        self.dbm.commit()
                        script_out_path = os.path.join(self.src_pipe_template_path, script.path)
                        script.path = self.file_man.make_path_relative(script_out_path)
                        script.arguments = json.dumps(script_arguments)
                        script.envs = json.dumps(script_envs)
                        script.resources = json.dumps(script_resources)
                        script.extra_packages = _dump_extra_packages(extra_pip, extra_conda)
                        self.dbm.save_obj(script)
                        logging.info("Added script to database\n")
                    else:
                        # logging.warning("Script is already present in database.\n")
                        script_out_path = os.path.join(self.src_pipe_template_path, script.path)
                        db_script.path = self.file_man.make_path_relative(script_out_path)
                        db_script.arguments = json.dumps(script_arguments)
                        db_script.envs = json.dumps(script_envs)
                        db_script.description = script.description
                        db_script.resources = json.dumps(script_resources)
                        db_script.extra_packages = _dump_extra_packages(extra_pip, extra_conda)
                        self.dbm.save_obj(db_script)
                        logging.warning((str(db_script.idx), db_script.name, db_script.path))

            os.chdir(oldwd) # Change dir back to old working directory.
            pipe_in_db = False
            for db_pipe in self.dbm.get_all_pipeline_templates():
                db_json = json.loads(db_pipe.json_template)
                if db_json['name'].lower() == pipe['name'].lower():
                    pipe_in_db = True
                    logging.warning(f"PipeTemplate already in database: {db_json['name'].lower()}")
                    db_pipe.json_template = json.dumps(pipe)
                    db_pipe.timestamp = datetime.now()
                    self.dbm.save_obj(db_pipe)
                    return error_message
            if not pipe_in_db:
                pipe_temp = model.PipeTemplate(json_template=json.dumps(pipe),
                                                timestamp=datetime.now(),
                                                group_id=self.user_id,
                                                pipe_project=self.namespace,
                                                install_path=self.install_path)
                
                self.dbm.save_obj(pipe_temp)
                logging.info("Added Pipeline: *** %s ***"%(pipe['name'],))
                return error_message
        except Exception as e:
            logging.error(e, exc_info=True)
            if not self.forTest:
                self.remove_pipe_project()
            logging.error('Cleanup successful. Removed buggy pipeline.')
            return error_message

    def remove_pipe_project(self):
        '''Remove an imported pipeline project from lost system.

        Returns:
            list of dict: Empty list if all pipe of a project could be deleted,
                a list of pipe that could not be deleted otherwise.

        Note:
            Pipeline folder in LOST filesystem and all related db
            entrys will be deleted.
        '''
        not_deleted_pipes = []
        for pipe in self.pipes:
            if self.remove_pipeline(pipe):
                pass
            else:
                not_deleted_pipes.append(pipe)
                logging.info('''Pipeline project {} was not completely removed 
                    since some pipes are still in use'''.format(self.namespace))
        if len(not_deleted_pipes) == 0:
            shutil.rmtree(self.install_path)
        return not_deleted_pipes

    def remove_pipeline(self, pipe):
        '''Remove all related db entrys of a pipeline from lost database.
        '''
        for db_pipe in self.dbm.get_all_pipeline_templates():
            db_json = json.loads(db_pipe.json_template)
            if db_json['name'].lower() == pipe['name'].lower():
                t = self.dbm.get_pipe(pipe_template_id=db_pipe.idx)
                if t is None:
                    for pe_j in db_json['elements']:
                        if 'script' in pe_j:
                            script_man.remove_script(self.dbm, 
                                os.path.join(self.namespace, 
                                    os.path.basename(pe_j['script']['path'])
                                )
                            )
                    self.dbm.delete(db_pipe)
                else:
                    logging.warning("Cannot remove pipeline. It is already in use by task with ID: %s"%(t.idx,))
                    return False
                self.dbm.commit()
                logging.info("Removed pipeline successfull: {}".format(pipe['name']))
                return True
        return True
    
class PipeDefChecker():
    '''Checks if a pipeline definition file is correct'''

    def __init__(self, logger):
        self.logger = logger

    def _check_key(self, key_name, dict_element, types, values=None):
        '''Check if a specific key is present in dict_element.
        
        Args:
            key_name (str): Name of the key.
            dict_element (dict): A dictionary.
            types (list): A list of types that are valid for the value.
            values (list): A list of possible values.

        Returns:
            Bool: True if key is present.
        '''
        # If dict_element is root element, do to not clutter
        # error message with all element entries!
        if 'elements' in dict_element:
            my_element = copy.deepcopy(dict_element)
            my_element['elements'] = '[...]'
        else:
            my_element = dict_element
        if key_name not in dict_element:
            self.logger.error(
                ('No *{}* found! Add a *{}* key '
                'to the following element:\n{}'
                ).format(
                    key_name, key_name, 
                    json.dumps(my_element, indent=4)
                )
            )
            return False
        else:
            type_ok = False
            value_ok = False
            # Check if value has correct type
            for t in types:
                if isinstance(dict_element[key_name], t):
                    type_ok = True
            if not type_ok:
                self.logger.error(('Value of **{}** needs to be one '
                        'of these types: {}\nBut got {}\nValue belongs to:\n{}'
                        ).format(key_name, types, 
                            type(my_element[key_name]), my_element))
                return False

            if values is not None:
                for v in values:
                    if v == dict_element[key_name]:
                        value_ok = True
                if not value_ok:
                    self.logger.error(('Value of **{}** needs to be one '
                            'of these specific values: {}\nValue belongs to:\n{}'
                            ).format(key_name, values, my_element))
                    return False
            return True

    def _check_script(self, pe):
        ret = True
        if not self._check_key('script', pe, [dict]):
            return False
        if not self._check_key('path', pe['script'], [str]):
            ret = False
        if not self._check_key('description', pe['script'], [str]):
            ret = False
        return ret

    def _check_datasource(self, pe):
        ret = True
        if not self._check_key('datasource', pe, [dict]):
            return False
        if not self._check_key('type', pe['datasource'], [str], values=['rawFile']):
            ret = False
        return ret

    def _check_loop(self, pe):
        ret = True
        if not self._check_key('loop', pe, [dict]):
            return False
        if not self._check_key('maxIteration', pe['loop'], [int, type(None)]):
            ret = False
        if not self._check_key('peJumpId', pe['loop'], [int]):
            ret = False
        return ret

    def _check_sia_config(self, pe):
        ret = True
        if not self._check_key('tools', pe, [dict]):
            ret = False
        else:
            if not self._check_key('point', pe['tools'], [bool]):
                ret = False
            if not self._check_key('line', pe['tools'], [bool]):
                ret = False
            if not self._check_key('polygon', pe['tools'], [bool]):
                ret = False
            if not self._check_key('bbox', pe['tools'], [bool]):
                ret = False
        if not self._check_key('annos', pe, [dict]):
            ret = False
        else:
            if not self._check_key('multilabels', pe['annos'], [bool]):
                ret = False
            if not self._check_key('minArea', pe['annos'], [int]):
                ret = False
            if not self._check_key('actions', pe['annos'], [dict]):
                ret = False
            else:
                if not self._check_key('label', pe['annos']['actions'], [bool]):
                    ret = False
                if not self._check_key('draw', pe['annos']['actions'], [bool]):
                    ret = False
                if not self._check_key('edit', pe['annos']['actions'], [bool]):
                    ret = False
        if not self._check_key('img', pe, [dict]):
            ret = False
        else:
            if not self._check_key('multilabels', pe['img'], [bool]):
                ret = False
            if not self._check_key('actions', pe['img'], [dict]):
                ret = False
            else:
                if not self._check_key('label', pe['img']['actions'], [bool]):
                    ret = False
        return ret
        
    def _check_mia_config(self, pe):
        ret = True
        if not self._check_key('type', pe, [str], values=['imageBased', 'annoBased']):
            ret = False
        if 'type' in pe:
            if pe['type'] == 'annoBased':
                if not self._check_key('drawAnno', pe, [bool]):
                     ret = False
                if not self._check_key('addContext', pe, [float]):
                     ret = False
        return ret

    def _check_annotask(self, pe):
        ret = True
        if not self._check_key('annoTask', pe, [dict]):
            return False
        if not self._check_key('name', pe['annoTask'], [str]):
            ret = False
        if not self._check_key('instructions', pe['annoTask'], [str]):
            ret = False
        if not self._check_key('configuration', pe['annoTask'], [dict]):
            ret = False
        if not self._check_key('type', pe['annoTask'], [str], values=['sia', 'mia']):
            ret = False
        if pe['annoTask']['type'] == 'sia':
            ret = self._check_sia_config(pe['annoTask']['configuration'])
        elif pe['annoTask']['type'] == 'mia':
            ret = self._check_mia_config(pe['annoTask']['configuration'])

        return ret

    def _check_pipe_element(self, pe):
        ret = True
        if not self._check_key('peN', pe, [int]):
            ret = False
        if not self._check_key('peOut', pe, [list, type(None)]):
            ret = False
        if 'script' in pe:
            ret = self._check_script(pe)
        elif 'annoTask' in pe:
            ret = self._check_annotask(pe)
        elif 'datasource' in pe:
            ret = self._check_datasource(pe)
        elif 'dataExport' in pe:
            ret = self._check_key('dataExport', pe, [dict])
        elif 'visualOutput' in pe:
            ret = self._check_key('visualOutput', pe, [dict])
        elif 'loop' in pe:
            ret = self._check_loop(pe)
        else:
            self.logger.error((
                'A pipeline element need to have one of these keys: '
                '*script*, *annoTask*, *datasource*, *dataExport*, '
                '*visualOutput* or *loop*'))
            ret = False
        if not ret:
            self.logger.error(
                'The error above occured in:\n{}'.format(
                    json.dumps(pe, indent=4))
            )
        return ret

    def check(self, pipeline_template):
        '''Check if pipeline template is correct.

        Args:
            pipelist_template (dict): The json parsed content of a 
                pipeline definition file.
        '''
        self.logger.info('Check: {}'.format(pipeline_template['name']))
        ret = True
        if not self._check_key('description', pipeline_template, [str]):
            ret = False
        if not self._check_key('author', pipeline_template, [str]):
            ret = False
        if not self._check_key('pipe-schema-version', pipeline_template, [str, float]):
            ret = False
        if not self._check_key('elements', pipeline_template, [list]):
            ret = False
        else:
            for pe in pipeline_template['elements']:
                if not self._check_pipe_element(pe):
                    ret = False
        # Check connections of all pipeline elements.
        if 'elements' in pipeline_template:
            if not self._check_connections(pipeline_template['elements']):
                ret = False

        if ret:
            self.logger.info('Pipeline definition file OK!')
            return True
        else:
            self.logger.error('Pipeline defintion file WRONG!')
            return False

    def _check_connections(self, pipe_elements):
        ret = True
        pe_map = dict()
        pe_out_set = set()
        for pe in pipe_elements:
            if pe['peN'] in pe_map:
                self.logger.error(('Multiple pipe elements have the '
                    'same peN: {}\nElements are:\n{}\n{}'.format(
                        pe['peN'], 
                        json.dumps(pe_map[pe['peN']], indent=4), 
                        json.dumps(pe, indent=4))))
                ret = False
            else:
                pe_map[pe['peN']] = pe
        for pe in pipe_elements:
            if pe['peOut'] is not None:
                for pe_out in pe['peOut']:
                    pe_out_set.add(pe_out)
                    if pe_out not in pe_map:
                        self.logger.error(('peN: {} points to peOut: {} '
                            'that does not exist! See element:\n{}').format(
                                pe['peN'], pe_out, json.dumps(pe, indent=4)))
                        ret = False
        for pe in pipe_elements:
            if pe['peN'] not in pe_out_set:
                self.logger.warning('No element is connected to peN: {}'.format(
                    pe['peN']))
        return ret

def pack_pipe_project(project_path, dst_path):
    dst, archive_format = os.path.splitext(dst_path)
    archive_format = archive_format.replace('.', '')
    shutil.make_archive(dst, archive_format, project_path)

def pack_pipe_project_to_stream(f, project_path):
    def rel_path(root, path):
        rel = path.replace(root, '')
        if rel.startswith('/'):
            rel = rel[1:]
        return rel
    def read_stream(path):
        with open(path, 'rb') as f:
            return f.read()
        
    with ZipFile(f, 'w') as zip_file:
        for root, dir_list, file_list in os.walk(project_path):
            # print(root, d, file_list)
            for my_file in file_list:
                rel = rel_path(project_path, os.path.join(root, my_file))
                print(rel)
                zip_file.writestr(rel, read_stream(os.path.join(root, my_file)))

def find_pipe_root_path(pp_path):
    j_list = glob(os.path.join(pp_path, '*.json'))
    if len(j_list) > 0:
        return pp_path
    for root, dirs, files in os.walk(pp_path):
        for f in files:
            if os.path.splitext(f)[1].lower() == '.json':
                # old_root = root 
                # new_root = os.path.join(os.path.split(old_root)[0], os.path.basename(pp_path))
                # os.rename(old_root, new_root)
                # return new_root
                return root
    raise Exception("No valid pipeline file found!")
    
def unpack_pipe_project(zip_project, dst_path):
    # res_dir = os.path.basename(dst_path)
    # res_dir = os.path.splitext(res_dir)[0]
    # dst = os.path.join(dst_path, res_dir)
    shutil.unpack_archive(zip_project, dst_path)
    # dirs = os.listdir(dst_path)
    # return find_pipe_root_path(dst_path)

    
class JSONDecodeError(Exception):

    def __str__(self):
        return 'JSON could not be decoded: Check your pipeline definition file(s) (.json).'