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
    pipe_templates = db_man.get_pipeline_templates_by_group(group_ids)
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
    group_ids = [g.idx for g in user.groups]
    available_label_trees = db_man.get_all_root_leaves_by_groups(group_ids)
    available_scripts = db_man.get_all_scripts()
    try:
         template_serialize = TemplateSerialize(template,
                                            available_raw_files, 
                                            available_label_trees, 
                                            available_groups,
                                            available_scripts)
    except TypeError:
            return "No JSON found in PipeTemplate."
    template_serialize.add_available_info()
    return template_serialize.template_json

class TemplateSerialize(object):
    template = None
    template_json = None
    available_raw_files = None
    available_label_trees = None
    available_groups = None
    available_scripts = None
    def __init__(self, template=None, available_raw_files=None,
                 available_label_trees=None,
                 available_groups=None,
                 available_scripts=None):
        self.template = template
        self.template_json = json.loads(template.json_template)
        self.available_raw_files = available_raw_files
        self.available_label_trees = available_label_trees
        self.available_groups = available_groups
        self.available_scripts = available_scripts

    def add_available_info(self):
        self.template_json['id'] = self.template.idx
        self.template_json['timestamp'] = self.template.timestamp
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
            label_tree_json = dict()
            label_tree_json['id'] = label_tree.idx
            label_tree_json['name'] = label_tree.name
            label_tree_json['description'] = label_tree.description
            label_tree_json['timestamp'] = label_tree.timestamp
            label_tree_json['groupName'] = label_tree.group.name
            label_leaves_json = list()
            for label_leaf in label_tree.label_leaves:
                label_leaf_json = dict()
                label_leaf_json['id'] = label_leaf.idx
                label_leaf_json['name'] = label_leaf.name
                label_leaf_json['abbreviation'] = label_leaf.abbreviation
                label_leaf_json['description'] = label_leaf.description
                label_leaf_json['groupName'] = "unknown"
                if label_leaf.group:
                    label_leaf_json['groupName'] = label_leaf.group.name
                label_leaf_json['timestamp'] = label_leaf.timestamp
                label_leaf_json['cssClass'] = label_leaf.css_class
                label_leaf_json['leafId'] = label_leaf.leaf_id
                label_leaf_json['parentLeafId'] = label_leaf.parent_leaf_id
                label_leaves_json.append(label_leaf_json)
            label_tree_json['labelLeaves'] = label_leaves_json 
            label_trees_json.append(label_tree_json)
        return label_trees_json

    def __at_groups(self):
        groups_json = list()
        for group in self.available_groups:
            group_json = dict()
            group_json['id'] = group.idx
            group_json['groupName'] = group.name
            group_json['isGroup'] = not group.is_user_default
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