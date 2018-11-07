from datetime import datetime
import json
import logging
import os
import shutil
from lost.logic.file_man import FileMan
from lost.logic import file_man as fm
from distutils import dir_util
from lost.db import model
import importlib
from lost.logic.script import get_default_script_arguments
from lost.logic.script import get_default_script_executors
from lost.logic.pipeline import cron
from distutils import dir_util
from os.path import join
from lost.db import dtype
from glob import glob
from lost.logic import script as script_man

def parse_script(element):
    '''Parese a script element in json string.

    Args:
        element (dict): The script element to parse.

    Returns:
        object: :class:`lost.db.model.Script`
    '''
    script_language_name = element['language'].upper()
    script_language = dtype.ScriptLanguage.PYTHON3
    if script_language_name == "PYTHON2":
        script_language = dtype.ScriptLanguage.PYTHON2
    script = model.Script(name=element['path'],
                        path=element['path'],
                        description=element['description'],
                        language=script_language)
    return script


class PipeImporter(object):

    def __init__(self, pipe_template_dir, group_name, dbm, forTest=False):
        '''Load json file.

        Args:
            pipe_template_dir: Path to pipeline directory
        '''
        self.forTest = forTest
        self.dbm = dbm
        self.file_man = FileMan(self.dbm.lostconfig)
        if pipe_template_dir.endswith('/'):
            pipe_template_dir = pipe_template_dir[:-1]
        self.src_pipe_template_path = pipe_template_dir
        self.dst_pipe_template_path = os.path.join(self.file_man.pipe_path,
            os.path.basename(self.src_pipe_template_path))
        self.json_files = glob(os.path.join(pipe_template_dir,'*.json'))
        self.pipes = []
        self.namespace = os.path.basename(self.src_pipe_template_path).strip('/')
        self.group = dbm.get_group_by_name(group_name)
        for json_path in self.json_files:
            with open(json_path) as jfile:
                pipe = json.load(jfile)
            pipe['namespace'] = self.namespace
            pipe['name'] = self._namespaced_name(
                os.path.splitext(os.path.basename(json_path))[0]
            )
            self.pipes.append(pipe)
            # Set name to name of the script file
            for pe in pipe['elements']:
                if 'script' in pe:
                    pe['script']['name'] = pe['script']['path']

    def _namespaced_name(self, name):
        return '{}.{}'.format(self.namespace, name)

    def update_pipe_project(self):
        if os.path.exists(self.dst_pipe_template_path):
            for pipe in self.pipes:
                self.update_pipe(pipe)
            dir_util.copy_tree(self.src_pipe_template_path, self.dst_pipe_template_path)
            logging.info("Copyed pipeline template dir from %s to %s"%(self.src_pipe_template_path,
                                                    self.dst_pipe_template_path))
        else:
            logging.warning('Cannot update. No such pipe project: {}'.format(
                self.namespace
            ))
    
    def update_pipe(self, pipe):
        for db_pipe in self.dbm.get_all_pipeline_templates():
            db_json = json.loads(db_pipe.json_template)
            # update pipeline if already present in db
            if db_json['name'].lower() == pipe['name'].lower():
                # Do everything relative from pipeline definition file path.
                oldwd = os.getcwd()
                os.chdir(self.src_pipe_template_path)
                db_pipe.json_template = json.dumps(pipe)
                self.dbm.save_obj(db_pipe)
                logging.info('Updated pipeline: {}'.format(db_json['name']))           
                for pe_j in pipe['elements']:
                    if 'script' in pe_j:
                        element_j = pe_j['script']
                        script = parse_script(element_j)
                        db_script = self.dbm.get_script(file_name=os.path.basename(script.path))
                        script_arguments = get_default_script_arguments(script.path)
                        script_executors = get_default_script_executors(script.path)
                        if 'arguments' in element_j:
                            for arg in element_j['arguments']:
                                if arg not in script_arguments:
                                    logging.error("Invalid argument >> {} << in pipeline definition json".format(arg))
                                    valid_args = ""
                                    for v_arg in script_arguments:
                                        valid_args += ">> {} <<\n".format(v_arg)
                                    logging.error("Valid arguments are: \n{}".format(valid_args[:-1]))
                                    raise Exception('Invalid arguments. Start Cleanup')
                        if db_script is None:
                            self.dbm.add(script)
                            self.dbm.commit()
                            script_out_path = os.path.join(self.dst_pipe_template_path, script.path)
                            script.path = self.file_man.make_path_relative(script_out_path)
                            script.arguments = json.dumps(script_arguments)
                            script.executors = json.dumps(script_executors)
                            self.dbm.save_obj(script)
                            logging.info("Added script to database")
                        else: 
                            script_out_path = os.path.join(self.dst_pipe_template_path, script.path)
                            db_script.path = self.file_man.make_path_relative(script_out_path)
                            db_script.arguments = json.dumps(script_arguments)
                            db_script.executors = json.dumps(script_executors)
                            db_script.description = script.description
                            db_script.language = script.language
                            self.dbm.save_obj(db_script)
                            logging.info('Updated script: {}'.format(db_script.name))
                os.chdir(oldwd) # Change dir back to old working directory.                
                return
        # import pipe if not already present in database    
        self.import_pipe(pipe)

    def start_import(self):
        if os.path.exists(self.dst_pipe_template_path):
            logging.warning('Cannot import pipeline!')
            logging.warning('Pipe Template Dir already exist: {}'.format(
                self.dst_pipe_template_path
            ))
            return
        dir_util.copy_tree(self.src_pipe_template_path, self.dst_pipe_template_path)
        logging.info("Copyed pipeline template dir from %s to %s"%(self.src_pipe_template_path,
                                                    self.dst_pipe_template_path))
        for pipe in self.pipes:
            self.import_pipe(pipe)

    def import_pipe(self, pipe):
        try:
            logging.info('\n**********************')
            # Do everything relative from pipeline definition file path.
            oldwd = os.getcwd()
            os.chdir(self.src_pipe_template_path)
            for db_pipe in self.dbm.get_all_pipeline_templates():
                db_json = json.loads(db_pipe.json_template)
                if db_json['name'].lower() == pipe['name'].lower():
                    logging.warning("PipeTemplate in database.")
                    logging.warning("Name of this template is: %s"%(pipe['name'],))
                    logging.warning("Will not import PipeTemplate.")
                    return db_pipe.idx
            pipe_temp = model.PipeTemplate(json_template=json.dumps(pipe),
                                            timestamp=datetime.now(), group_id=self.group.idx)
            self.dbm.save_obj(pipe_temp)
            logging.info("Added PipeTemplate to database")
            logging.info("Name of this template is: %s"%(pipe['name'],))
            logging.info("Template is visible for Group '{}'".format(self.group.name))
            for pe_j in pipe['elements']:
                if 'script' in pe_j:
                    element_j = pe_j['script']
                    script = parse_script(element_j)
                    db_script = self.dbm.get_script(file_name=os.path.join(
                        self.namespace,
                        os.path.basename(script.path)))
                    script_arguments = get_default_script_arguments(script.path)
                    script_executors = get_default_script_executors(script.path)
                    if 'arguments' in element_j:
                        for arg in element_j['arguments']:
                            if arg not in script_arguments:
                                logging.error("Invalid argument >> {} << in pipeline definition json".format(arg))
                                valid_args = ""
                                for v_arg in script_arguments:
                                    valid_args += ">> {} <<\n".format(v_arg)
                                logging.error("Valid arguments are: \n{}".format(valid_args[:-1]))
                                raise Exception('Invalid arguments. Start Cleanup')
                    if db_script is None:
                        self.dbm.add(script)
                        self.dbm.commit()
                        script_out_path = os.path.join(self.dst_pipe_template_path, script.path)
                        script.path = self.file_man.make_path_relative(script_out_path)
                        script.arguments = json.dumps(script_arguments)
                        script.executors = json.dumps(script_executors)
                        self.dbm.save_obj(script)
                        logging.info("Added script to database")
                    else:
                        logging.warning("Script is already present in database.")
                        logging.warning((str(db_script.idx), db_script.name, db_script.path))
            os.chdir(oldwd) # Change dir back to old working directory.
            return pipe_temp.idx
        except:
            if not self.forTest:
                self.remove_pipeline(pipe)
            logging.error('Cleanup successful. Removed buggy pipeline.')

    def remove_pipe_project(self):
        '''Remove an imported pipeline project from lost system.

        Note:
            Pipeline folder in LOST filesystem and all related db
            entrys will be deleted.
        '''
        clean_filesystem = True
        for pipe in self.pipes:
            if not self.remove_pipeline(pipe):
                clean_filesystem = False
        if clean_filesystem:
            shutil.rmtree(self.dst_pipe_template_path)
            logging.info('Removed pipeline project from lost filesystem {}'.format(
                self.dst_pipe_template_path
            ))
            logging.info('Whole pipeline project {} was successfull removed'.format(
                self.namespace
            ))
        else:
            logging.info('''Pipeline project {} was not completely removed 
                since some pipes are still in use'''.format(self.namespace))

    def remove_pipeline(self, pipe):
        '''Remove all related db entrys of a pipeline from lost database.
        '''
        #TODO: Remove script
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

class TemplateQuery(object):
    '''A Class to query the dict representation of a pipeline definition json file.

    Attributes:
        pipe_template (dict): Dict representation of a pipeline template.
    '''

    def __init__(self, pipe_template):
        '''Init

        Args:
            pipe_template (dict): Dict representation of a PipelineTemplate json
        '''
        self.pipe_template = pipe_template

    def get_script(self, filename):
        '''Get a script element by scriptname

        Args:
            filename (str): Filename or path to a script. Script elemnts are
                identified by the filename of the script.

        Returns:
            dict : A script element in dictionary format. E.g.:
                    {
                    "name" : "TestScript",
                    "path": "../../scripts/testscript.py",
                    "description" : "Test",
                    "language" : "python3",
                    "arguments" : {"arg1" : {
                                                {"value" : "val1"},
                                                {"help" : "helptext"}
                                            }
                                }
                    }
        '''
        f_name = os.path.basename(filename)
        for element in self.pipe_template['elements']:
            if 'script' in element:
                if os.path.basename(element['script']['path']) == f_name:
                    return element
        return {}

    def get_script_args(self, filename):
        '''Get arguments of a script element.

        Args:
            filename: Filename or path to a script. Scripts will be identified by

        Returns:
            dict : A arguments dict in format {"arg1":"value1",...,"argn":"valuen"}
                If no arguments are found, an empty dictionary will be returned.
        '''
        script = self.get_script(filename)
        if 'arguments' in script:
            return script['arguments']
        return {}

class PipePacker(object):

    def __init__(self, pipe_template_file):
        '''Load json file.

        Args:
            pipe_template_file: Pipeline definition file.
        '''
        self.json_path = os.path.abspath(pipe_template_file)
        self.pipe_template_path = os.path.split(pipe_template_file)[0]
        with open(self.json_path) as jfile:
            self.pipe = json.load(jfile)

    def pack(self, dst_path):
        '''Pack pipeline to zip file.

        Args:
            dst_path: Path to store zipfile. E.g 'test/my_cool_pipe.zip'
        '''
        # Do everything relative from pipeline definition file path.
        tmp = dict()
        used_lib_paths = dict()
        used_static_paths = dict()
        tmp_path = os.path.abspath('tmp_pipe_packer')
        tmp['root'] = os.path.join(tmp_path, self.pipe['name'])
        dst = os.path.abspath(dst_path)
        oldwd = os.getcwd()
        os.chdir(self.pipe_template_path)
        for pe_j in self.pipe['elements']:
            if 'script' in pe_j:
                element_j = pe_j['script']
                script = parse_script(element_j)
                src_script_dir_path = os.path.split(script.path)[0]
                # Calculate all paths
                tmp['script.rel'] = os.path.splitext(os.path.basename(script.path))[0]
                tmp['script.abs'] = os.path.join(tmp['root'], tmp['script.rel'])
                # Create folder structure
                if not os.path.exists(tmp['script.abs']):
                    dir_util.mkpath(tmp['script.abs'])
                # Copy files
                dir_util.copy_tree(src_script_dir_path, tmp['script.abs'])
                logging.info("Copyed script from %s to %s"%(src_script_dir_path,
                                                            tmp['script.abs']))
                script_name = os.path.basename(script.path)
                # Write new paths to back to json dict
                element_j['path'] = script_name
        with open(join(tmp['root'], os.path.basename(self.json_path)), 'w') as outfile:
            json.dump(self.pipe, outfile)
        fm.zipdir(src=tmp['root'], dst=dst)
        dir_util.remove_tree(tmp_path)
        os.chdir(oldwd) # Change dir back to old working directory.
