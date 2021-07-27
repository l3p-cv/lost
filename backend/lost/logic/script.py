import logging
import traceback
from lost.logic.file_man import FileMan
import importlib
import os
import json
import sys
import ast

def remove_script(dbm, file_name):
    db_script = dbm.get_script(file_name=file_name)
    if db_script is not None:
        db_pe = dbm.get_pipe_element(script_id=db_script.idx)
        if db_pe is None:
            dbm.delete(db_script)
            dbm.commit()
            # file_man = FileMan(dbm.lostconfig)
            # file_man.rm_script_folder(db_script)
            logging.info("Removed script: %s"%(file_name,))
        else:
            logging.info("Can not remove script: %s . It is used by task with ID %d"%(file_name, db_pe.pipe_id))
    else:
        logging.info("Script with name: %s is not present in database"%(file_name,))

def get_default_script_arguments(script_path):
    try:
        #sys.path.append(os.path.split(script_path)[0])
        #custom_script = importlib.machinery.SourceFileLoader(os.path.basename(script_path).replace('.py',''),
        #                                     script_path).load_module()
        #return custom_script.ARGUMENTS
        arg_dict = parse_script_constants(script_path, 'ARGUMENTS')
        if arg_dict is None:
            logging.warning('Script has no ARGUMENTS: {}!'.format(script_path))
            return {}
        else:
            logging.info('Found ARGUMENTS: {}'.format(arg_dict))
            return arg_dict
    except Exception:
        logging.error(traceback.format_exc())

def get_default_script_envs(script_path):
    try:
        exec_list = parse_script_constants(script_path, 'ENVS', 
                                          bracket_type='[')
        if exec_list is None:
            logging.warning('Script has no ENVS: {}!'.format(script_path))
            return []
        else:
            envs = [e.lower() for e in exec_list]
            logging.info('Found ENVS: {}'.format(envs))
            return envs
    except Exception:
        logging.error(traceback.format_exc())

def get_extra_pip(script_path):
    try:
        exec_list = parse_script_constants(script_path, 'EXTRA_PIP', 
                                          bracket_type='[')
        if exec_list is None:
            logging.warning('Script has no EXTRA_PIP: {}!'.format(script_path))
            return []
        else:
            # envs = [e.lower() for e in exec_list]
            envs = exec_list
            logging.info('Found EXTRA_PIP: {}'.format(envs))
            return envs
    except Exception:
        logging.error(traceback.format_exc())

def get_extra_conda(script_path):
    try:
        exec_list = parse_script_constants(script_path, 'EXTRA_CONDA', 
                                          bracket_type='[')
        if exec_list is None:
            logging.warning('Script has no EXTRA_PIP: {}!'.format(script_path))
            return []
        else:
            # envs = [e.lower() for e in exec_list]
            envs = exec_list
            logging.info('Found EXTRA_PIP: {}'.format(envs))
            return envs
    except Exception:
        logging.error(traceback.format_exc())

def get_script_args(script_path, arg_name, bracket_type='[', to_lower=True):
    try:
        arg_list = parse_script_constants(script_path, arg_name, 
                                          bracket_type=bracket_type)
        if arg_list is None:
            logging.warning('Script has no {}: {}!'.format(arg_name, script_path))
            return []
        else:
            if to_lower:
                args = [e.lower() for e in arg_list]
            else:
                args = arg_list
            logging.info('Found {}: {}'.format(arg_name, args))
            return args
    except Exception:
        logging.error(traceback.format_exc())

def get_default_script_resources(script_path):
    try:
        res_list = parse_script_constants(script_path, 'RESOURCES', 
                                          bracket_type='[')
        if res_list is None:
            logging.warning('Script has no special RESOURCES requirements: {}!'.format(script_path))
            return []
        else:
            res = [e.lower() for e in res_list]
            logging.info('Found RESOURCES requirements: {}'.format(res))
            return res
    except Exception:
        logging.error(traceback.format_exc())

def _is_comment_line(line_raw):
    line = line_raw.replace(" ", "")
    line = line.replace("\t", "")
    if len(line) < 1:
        return False
    if line[0] == '#':
        return True
    else:
        return False

def parse_script_constants(script_path, constant_name, bracket_type='{'):
    if bracket_type == '{':
        b_open = '{'
        b_close = '}'
    elif bracket_type =='[':
        b_open = '['
        b_close = ']'
    else:
        raise Exception('Wrong bracket_type! Use { or [')

    with open(script_path) as f:
        args = ''
        for line in f:
            if _is_comment_line(line):
                continue
            if constant_name in line:
                open_count = line.count(b_open)
                start = line.find(b_open)
                close_count = line.count(b_close)
                if start == -1:
                    line = f.readline()
                    start = 0
                    open_count = line.count(b_open)
                    close_count = line.count(b_close)
                args += line[start:]
                while open_count != close_count:
                    line = f.readline()
                    comment = line.find('#')
                    if comment != -1:
                        line = line[:comment+1] #Remove comments
                    args += line
                    open_count += line.count(b_open)
                    close_count += line.count(b_close)
                # args = args.replace('\'','\"') #Make it json parsable
                arg_dict = ast.literal_eval(args)
                return arg_dict

        #No arguments for this script
        return None
