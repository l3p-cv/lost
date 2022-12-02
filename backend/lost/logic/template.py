import json
from datetime import datetime
from lost import settings
from lost.logic.file_access import UserFileAccess
from lost.db import model, access, dtype
from lost.logic.file_man import FileMan
from lost.logic.label import LabelTree
__author__ = "Gereon Reus"

############################ get_templates ########################
#                                                                 #
###################################################################
def get_templates(db_man, group_id=None, add_global=False, debug_mode=False):
    '''Read out all templates.

    Args:
        db_man:
        visibility: Visibility level
        debug_mode (Boolean): Weather to load PipeTemplate in debug too
    
    Returns: 
        JSON with all meta info about the pipe templates.
    '''
    if not group_id:
        pipe_templates = db_man.get_all_pipeline_templates(global_only=True)
    elif group_id:
        if add_global:
            pipe_templates = db_man.get_all_pipeline_templates(group_id=group_id, add_global=True)
        else:
            pipe_templates = db_man.get_all_pipeline_templates(group_id=group_id)
    pipe_templates_json = dict()
    pipe_templates_json["templates"] = list()

    for temp in pipe_templates:
        pipe_template_json = dict()
        # filter templates with debug mode
        if not debug_mode:
            if temp.is_debug_mode:
                continue
        for r in db_man.count_pipelines_by_template_id(temp.idx)[0]:
            pipelineCount = r
        pipe_template_json['isDebug'] = temp.is_debug_mode
        pipe_template_json['id'] = temp.idx
        pipe_template_json['date'] = temp.timestamp.strftime(settings.STRF_TIME)
        pipe_template_json['group_id'] = temp.group_id
        pipe_template_json['pipeProject'] = temp.pipe_project
        pipe_template_json['pipelineCount'] = pipelineCount
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
    available_raw_files =dict() #file_man.get_media_rel_path_tree()
    available_groups = db_man.get_groups()
    default_group = db_man.get_group_by_name(user.user_name)
    available_label_trees = db_man.get_all_label_trees(group_id=default_group.idx, add_global=True)
    available_scripts = db_man.get_all_scripts()
    available_fs = list(db_man.get_public_fs())
    for user_group in db_man.get_user_groups_by_user_id(user.idx):
        if user_group.group.is_user_default:
            group_id = user_group.group.idx
    available_fs += list(db_man.get_fs(group_id=group_id))
    
    try:
         template_serialize = TemplateSerialize(db_man, template,
                                            available_raw_files, 
                                            available_label_trees, 
                                            available_groups,
                                            available_scripts,
                                            available_fs, user)
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
                 available_scripts=None,
                 available_fs=None,
                 user=None):
        self.dbm = dbm
        self.template = template
        self.template_json = json.loads(template.json_template)
        self.available_raw_files = available_raw_files
        self.available_label_trees = available_label_trees
        self.available_groups = available_groups
        self.available_scripts = available_scripts
        self.available_fs = available_fs
        self.user = user

    def add_available_info(self):
        self.template_json['id'] = self.template.idx
        self.template_json['timestamp'] = self.template.timestamp.strftime(settings.STRF_TIME)
        self.template_json['availableGroups'] = self.__groups()
        self.template_json['availableLabelTrees'] = self.__label_trees()

        for pe in self.template_json['elements']:
            if 'datasource' in pe:
                if pe['datasource']['type'] == 'rawFile':
                    pe['datasource']['fileTree'] = self.available_raw_files
                    pe['datasource']['filesystems'] = self.__get_filesystem_infos()
            elif 'script' in pe:
                pe['script']['arguments'] = self.__script_arguments(pe)
                pe['script']['id'] = self.__script_id(pe)
                pe['script']['envs'] = self.__script_envs(pe)
   
    def __get_filesystem_infos(self):
        res = []
        for fs in self.available_fs:
            try:
                ufa = UserFileAccess(self.dbm, self.user, fs)
            except:
                pass
            res.append({
                'name': fs.name,
                'id': fs.idx,
                'rootPath': fs.root_path,
                'permission': ufa.get_permission(),
                'fsType': fs.fs_type
            })
        return res

    def __label_trees(self):
        label_trees_json = list()
        for label_tree in self.available_label_trees:
            if len(label_tree.label_leaves) > 0:
                label_trees_json.append(LabelTree(self.dbm, label_tree.idx).to_hierarchical_dict())
        return label_trees_json

    def __groups(self):
        groups_json = list()
        for group in self.available_groups:
            group_json = dict()
            group_json['id'] = group.idx
            group_name = group.name
            if group.is_user_default:
                group_name += " (user)"
            else:
                group_name += " (group)"
            group_json['name'] = group.name
            group_json['groupName'] = group_name
            group_json['isUserDefault'] = group.is_user_default
            groups_json.append(group_json)
        return groups_json

    def __script_arguments(self, pe):
        for script in self.available_scripts:
            if script.name.lower() == pe['script']['name'].lower():
                return combine_arguments(pe, script)
        return ""
    def __script_envs(self, pe):
        for script in self.available_scripts:
            if script.name.lower() == pe['script']['name'].lower():
                return script.envs
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