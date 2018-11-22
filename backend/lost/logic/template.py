import json
from datetime import datetime
from lost.db import model, access, dtype
from lost.logic.file_man import FileMan
from lost.logic.label import LabelTree
__author__ = "Gereon Reus"

############################ get_templates ########################
#                                                                 #
###################################################################
def get_templates(db_man, debug_mode=False):
    '''Read out all templates.

    Args:
        db_man:
        debug_mode (Boolean): Weather to load PipeTemplate in debug too
    
    Returns: 
        JSON with all meta info about the pipe templates.
    '''
    pipe_templates = db_man.get_all_pipeline_templates()
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
def get_template(db_man, template_id ,user):
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
    available_raw_files = file_man.get_media_rel_path_tree()
    available_groups = user.groups
    available_label_trees = db_man.get_all_label_trees()
    available_scripts = db_man.get_all_scripts()
    try:
         template_serialize = TemplateSerialize(db_man, template,
                                            available_raw_files, 
                                            available_label_trees, 
                                            available_groups,
                                            available_scripts)
    except TypeError:
            return "No JSON found in PipeTemplate."
    template_serialize.add_available_info()
    return template_serialize.template_json

class TemplateSerialize(object):
    dbm = None
    template = None
    template_json = None
    available_raw_files = None
    available_label_trees = None
    available_groups = None
    available_scripts = None
    def __init__(self, dbm, template=None, available_raw_files=None,
                 available_label_trees=None,
                 available_groups=None,
                 available_scripts=None):
        self.dbm = dbm
        self.template = template
        self.template_json = json.loads(template.json_template)
        self.available_raw_files = available_raw_files
        self.available_label_trees = available_label_trees
        self.available_groups = available_groups
        self.available_scripts = available_scripts

    def add_available_info(self):
        self.template_json['id'] = self.template.idx
        for pe in self.template_json['elements']:
            if 'datasource' in pe:
                if pe['datasource']['type'] == 'rawFile':
                    pe['datasource']['availableRawFiles'] = self.__ds_raw_files()
            elif 'annoTask' in pe:
                pe['annoTask']['availableLabelTrees'] = self.__at_label_trees()
                pe['annoTask']['availableGroups'] = self.__at_groups()
            elif 'script' in pe:
                pe['script']['arguments'] = self.__script_arguments(pe)
                pe['script']['id'] = self.__script_id(pe)
                pe['script']['executors'] = self.__script_executors(pe)
  
    def __ds_raw_files(self):
        raw_files_json = list()
        for raw_file in self.available_raw_files:
            raw_files_json.append(raw_file)
        return raw_files_json
    

    def __at_label_trees(self):
        label_trees_json = list()
        for label_tree in self.available_label_trees:
            label_trees_json.append(LabelTree(self.dbm, label_tree.idx).to_hierarchical_dict())
        return label_trees_json

    def __at_groups(self):
        groups_json = list()
        for group in self.available_groups:
            group_json = dict()
            group_json['id'] = group.idx
            group_json['groupName'] = group.name
            group_json['isUserDefault'] = group.is_user_default
            groups_json.append(group_json)
        return groups_json

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