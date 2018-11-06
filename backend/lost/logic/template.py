import json
from datetime import datetime
from lost.db import model, access, dtype
from lost.logic.file_man import FileMan
__author__ = "Gereon Reus"

############################ get_templates ########################
#                                                                 #
###################################################################
def get_templates(db_man, group_ids, debug_mode=False):
    '''Read out all templates.

    Args:
        db_man:
        debug_mode (Boolean): Weather to load PipeTemplate in debug too
    
    Returns: 
        JSON with all meta info about the pipe templates.
    '''
    pipe_templates = db_man.get_pipeline_templates(group_ids)
    pipe_templates_json = dict()
    pipe_templates_json["templates"] = list()

    for temp in pipe_templates:
        pipe_template_json = dict()
        # filter templates with debug mode
        if not debug_mode:
            if temp.is_debug_mode:
                continue
        pipe_template_json['isDebug'] = temp.is_debug_mode
        pipe_template_json['id'] = temp.idx
        pipe_template_json['date'] = temp.timestamp
        content = json.loads(temp.json_template)
        # --------------- name  ------------------------------
        try:
            pipe_template_json['name'] = content['name']
            if pipe_template_json['name'].isspace():
                raise NameError("Pipe Template must contain a name.")
            if pipe_template_json['name'] == "":
                raise NameError("Pipe Template must contain a name.")
        except KeyError:
            continue
        except NameError:
            continue

        # --------------- description  -----------------------
        try:
            pipe_template_json['description'] = content['description']
        except KeyError:
             pipe_template_json['description'] = "No description"
        
        # --------------- author  ----------------------------
        try:
            pipe_template_json['author'] = content['author']
        except KeyError:
             pipe_template_json['author'] = "Unknown author"



        pipe_templates_json["templates"].append(pipe_template_json)
    return pipe_templates_json

############################ get_template #########################
#                                                                 #
###################################################################
def get_template(db_man, template_id):
    ''' read out one template

    Args:
        db_man:
        template_id: id of the template
    Returns: JSON with all nescessary template info 
    ''' 
    #TODO: implement the following access methods
    template = db_man.get_pipe_template(template_id)
    if template is None:
        error_msg = "PipeTemplate with ID '"+ str(template_id) + "' does not exist."
        try:
            raise PipeTemplateNotFoundError(error_msg)
        finally:
            return error_msg
    file_man = FileMan(db_man.lostconfig)
    available_datasets = db_man.get_available_datasets()
    available_model_trees = db_man.get_available_model_trees()
    available_raw_files = file_man.get_media_rel_path_tree()
    available_label_trees = db_man.get_available_label_trees()
    available_users = db_man.get_available_users()
    available_scripts = db_man.get_all_scripts()
    try:
         template_serialize = TemplateSerialize(template, 
                                            available_datasets, 
                                            available_model_trees,
                                            available_raw_files, 
                                            available_label_trees, 
                                            available_users,
                                            available_scripts)
    except TypeError:
            return "No JSON found in PipeTemplate."
    template_serialize.add_available_info()
    return template_serialize.template_json

class TemplateSerialize(object):
    template_json = None
    available_datasets = None
    available_model_trees = None
    available_raw_files = None
    available_label_trees = None
    available_users = None
    available_scripts = None
    def __init__(self, template=None, available_datasets=None,
                 available_model_trees=None, available_raw_files=None,
                 available_label_trees=None,
                 available_users=None,
                 available_scripts=None):
        self.template_json = json.loads(template.json_template)
        self.available_datasets = available_datasets
        self.available_model_trees = available_model_trees
        self.available_raw_files = available_raw_files
        self.available_label_trees = available_label_trees
        self.available_users = available_users
        self.available_scripts = available_scripts

    def add_available_info(self):
        for pe in self.template_json['elements']:
            if 'datasource' in pe:
                if pe['datasource']['type'] == 'dataset':
                    pe['datasource']['availableDatasets'] = self.__ds_datasets()
                elif pe['datasource']['type'] == 'modelLeaf':
                    pe['datasource']['availableModelTrees'] = self.__ds_model_tress()
                elif pe['datasource']['type'] == 'rawFile':
                    pe['datasource']['availableRawFiles'] = self.__ds_raw_files()
            elif 'annoTask' in pe:
                pe['annoTask']['availableLabelTrees'] = self.__at_label_trees()
                pe['annoTask']['availableUser'] = self.__at_user()
            elif 'script' in pe:
                pe['script']['arguments'] = self.__script_arguments(pe)
                pe['script']['id'] = self.__script_id(pe)
                pe['script']['executors'] = self.__script_executors(pe)
    def __ds_datasets(self):
        datasets_json = list()
        for dataset in self.available_datasets:
                dataset_json = dict()
                dataset_json['id'] = dataset.idx
                dataset_json['name'] = dataset.name
                dataset_json['description'] = dataset.description
                dataset_json['timestamp'] = dataset.timestamp
                if dataset.user:
                    dataset_json['userName'] = dataset.user.first_name + " " + dataset.user.last_name
                else: 
                    dataset_json['userName'] = "Unknown"
                datasets_json.append(dataset_json)
        return datasets_json

    def __ds_model_tress(self):
        model_trees_json = list()
        for model_tree in self.available_model_trees:
            model_tree_json = dict()
            model_tree_json['id'] = model_tree.idx
            model_tree_json['name'] = model_tree.name
            model_tree_json['description'] = model_tree.description
            model_tree_json['timestamp'] = model_tree.timestamp
            if model_tree.user:
                model_tree_json['userName'] = model_tree.user.first_name + " " + model_tree.user.last_name
            else:
                model_tree_json['userName'] = "Unknown"
            model_leaves_json = list()
            for model_leaf in model_tree.model_leaves:
                model_leaf_json = dict()
                model_leaf_json['id'] = model_leaf.idx
                model_leaf_json['parentId'] = model_leaf.parent_id
                model_leaf_json['name'] = model_leaf.name
                model_leaf_json['description'] = model_leaf.description
                model_leaf_json['timestamp'] = model_leaf.timestamp
                if model_leaf.user:
                    model_leaf_json['userName'] = model_leaf.user.first_name + " " + model_leaf.user.last_name
                    model_leaf_json['userName'] = "Unknown"
                model_leaf_json['isMaster'] = model_leaf.is_master
                model_leaf_json['architecture'] = model_leaf.architecture
                model_leaf_json['framework'] = model_leaf.framework
                model_leaf_json['initialTrainedBy'] = model_leaf.initial_trained_by
                model_leaves_json.append(model_leaf_json)
            model_tree_json['modelLeaves'] = model_leaves_json
            model_trees_json.append(model_tree_json)
        return model_trees_json
    def __ds_raw_files(self):
        raw_files_json = list()
        for raw_file in self.available_raw_files:
            raw_files_json.append(raw_file)
        return raw_files_json
            # raw_file_json = dict()
            # raw_file_json['id'] = raw_file.idx
            # raw_file_json['path'] = raw_file.path
            # raw_file_json['timestamp'] = raw_file.timestamp
            # if raw_file.user:
            #     raw_file_json['userName'] = raw_file.user.first_name + " " + raw_file.user.last_name
            # else:
            #     raw_file_json['userName'] = "Unknown"
            # if raw_file.type == dtype.RawFile.VIDEO:
            #     raw_file_json['type'] = 'video'
            # elif raw_file.type == dtype.RawFile.FILE:
            #     raw_file_json['type'] = 'file'
            # elif raw_file.type == dtype.RawFile.IMAGESET:
            #     raw_file_json['type'] = 'imageset'
            # elif raw_file.type == dtype.RawFile.URL:
            #     raw_file_json['type'] = 'url'
            # raw_file_json['metaData'] = raw_file.meta_data
            # raw_files_json.append(raw_file_json)

    def __at_label_trees(self):
        label_trees_json = list()
        for label_tree in self.available_label_trees:
            label_tree_json = dict()
            label_tree_json['id'] = label_tree.idx
            label_tree_json['name'] = label_tree.name
            label_tree_json['description'] = label_tree.description
            label_tree_json['timestamp'] = label_tree.timestamp
            if label_tree.user:
                label_tree_json['userName'] = label_tree.user.first_name + " " + label_tree.user.last_name
            else:
                label_tree_json['userName'] = "Unknown"
            label_leaves_json = list()
            for label_leaf in label_tree.label_leaves:
                label_leaf_json = dict()
                label_leaf_json['id'] = label_leaf.idx
                label_leaf_json['name'] = label_leaf.name
                label_leaf_json['abbreviation'] = label_leaf.abbreviation
                label_leaf_json['description'] = label_leaf.description
                if label_leaf.user:
                    label_leaf_json['userName'] = label_leaf.user.first_name + " " + label_leaf.user.last_name
                else:
                    label_leaf_json['userName'] = "Unknown"
                label_leaf_json['timestamp'] = label_leaf.timestamp
                label_leaf_json['cssClass'] = label_leaf.css_class
                label_leaf_json['leafId'] = label_leaf.leaf_id
                label_leaf_json['parentLeafId'] = label_leaf.parent_leaf_id
                label_leaves_json.append(label_leaf_json)
            label_tree_json['labelLeaves'] = label_leaves_json 
            label_trees_json.append(label_tree_json)
        return label_trees_json
    def __at_user(self):
        users_json = list()
        for user in self.available_users:
            user_json = dict()
            user_json['id'] = user.idx
            user_json['userName'] = user.user_name
            user_json['photoPath'] = user.photo_path
            user_json['name'] = user.first_name + " " + user.last_name 
            users_json.append(user_json)
        return users_json

    def __script_arguments(self, pe):
        for script in self.available_scripts:
            if script.name.lower() == pe['script']['name'].lower():
                return combine_arguments(pe, script)
        return ""
    def __script_executors(self, pe):
        for script in self.available_scripts:
            if script.name.lower() == pe['script']['name'].lower():
                return script.executors
        return ""
    def __script_id(self, pe):
        for script in self.available_scripts:
            if script.name.lower() == pe['script']['name'].lower():
                return script.idx
        return None



############################ get_template_creation_data ###########
#                                                                 #
###################################################################
def get_template_creation_data(db_man):
    return "Not implemented yet."

############################ delete ###############################
#                                                                 #
###################################################################
def delete(db_man, data):
    pass 

############################ create_template ######################
#                                                                 #
###################################################################
def create_template(db_man, data):
    pass

############################ utils ################################
#                                                                 #
###################################################################
def combine_arguments(dict_pe, script):
    '''Helper method to compine script arguments from different places.

    Args:
        dict_pe (dict): A pipe element from json.
        script (Script): A :class:`lost.db.Script` object from data model.

    Returns:
        "return_description"
    '''
    if script.arguments:
        script_args = json.loads(script.arguments)
        if script_args is None:
            return {}
        if 'arguments' in dict_pe['script']:
            template_args = dict_pe['script']['arguments']
            # script_aruments = json.loads(script.arguments)
            for arg in script_args:
                if arg not in template_args:
                    template_args[arg] = script_args[arg]
            return template_args
        elif script_args:
            return script_args
    else:
        return {}

class PipeTemplateNotFoundError(Exception):
    def __init__(self, message):
        self.message = message