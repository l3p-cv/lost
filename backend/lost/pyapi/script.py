'''
A modul for basic interaction of custom scripts with the portal.
'''
__author__ = 'Jonas Jäger'

from lost.db import access
from lost.db import dtype, state
from lost.logic.file_access import UserFileAccess
from lost.logic import log
from lost.pyapi import inout
import argparse
import datetime
import traceback
import os
from lostconfig import LOSTConfig
import json
from lost.pyapi import pe_base
from lost.logic.label import LabelTree
from lost.pyapi import pipe_elements
from lost.logic.db_access import UserDbAccess
import ast 

def report_script_err(pipe_element, task, dbm, msg):
    '''Report an error for a script to portal

    Args:
        msg (str): The error message that should be reported.

    Note:
        You can call this method multiple times if you like. All messages
        will be concatenated and sent to the portal.
    '''
    if pipe_element.error_msg is None:
        pipe_element.error_msg = str(msg)
    else:
        pipe_element.error_msg += str(msg)
    debug_info = "\nPipeElementID = {}".format(pipe_element.idx)
    pipe_element.error_msg += debug_info
    pipe_element.state = state.PipeElement.SCRIPT_ERROR
    task.state = state.Pipe.ERROR
    dbm.add(task)
    dbm.add(pipe_element)
    dbm.commit()

class Script(pe_base.Element):
    '''Superclass for a user defined Script.

    Custom scripts need to inherit from Script and implement the main method.

    Attributes:
        pe_id (int): Pipe element id. Assign the pe id of a pipline script
            in order to emulate this script in a jupyter notebook for example.
    '''
    def __init__(self, pe_id=None):
        if pe_id is None:
            parser = argparse.ArgumentParser(description='A user defined script.')
            parser.add_argument('--idx', nargs='?', action='store',
                                help='Id of related pipeline element.')
            args = parser.parse_args()
        lostconfig = LOSTConfig()
        dbm = access.DBMan(lostconfig)
        self._dbm = dbm #type: lost.db.access.DBMan
        if pe_id is None:
            pe = dbm.get_pipe_element(int(args.idx))
        else:
            pe = dbm.get_pipe_element(pe_id)
        super().__init__(pe, dbm)

        user_id = self.pipe_info.user.idx
        self.user_id = user_id
        db_fs = dbm.get_user_default_fs(user_id)
        self.ufa = UserFileAccess(dbm, self.pipe_info.user, db_fs)
        self.dba = UserDbAccess(dbm, user_id)

        logfile_path = self.ufa.get_pipe_log_path(self._pipe.idx)
        self._log_stream = self.ufa.fs.open(logfile_path, 'a')
        self._logger = log.get_stream_logger(os.path.basename(pe.script.path),
                                          self._log_stream)
        if self.pipe_info.logfile_path is None or not self.pipe_info.logfile_path:
            self.pipe_info.logfile_path = logfile_path
        self._inp = inout.Input(self)
        self._outp = inout.ScriptOutput(self)
        self.rejected_execution = False
        # If pe_id is None we have a normal script
        # If pe_id is not None a JupyterNotebook uses this script
        if pe_id is None:
            return self._run()

    def _run(self, ret_success=False):
        try:
            self.main()
            self.i_am_done()
            success = 'PipeElementID: {}, Successfully executed script: {}'.format(
                self._pipe_element.idx, self._pipe_element.script.name)
            self._dbm.close_session()
            if ret_success:
                return success
        except:
            err_msg = str(datetime.datetime.now()) + '\n'
            err_msg += traceback.format_exc()
            self.report_err(err_msg)
            self._dbm.close_session()
    
    def __str__(self):
        my_str = 'I am a Script.\nMy name is: {}\nPipeElementID: {}'.format(self._pipe_element.script.name, 
                                                                            self._pipe_element.idx)
        return my_str

    def main(self):
        #raise NotImplementedError("You need to implement a main method to get your Script running.")
        pass

    @property
    def logger(self):
        ''':class:`logging.Logger`: A standard python logger for this script. 
        
        It will log to the pipline log file.
        '''
        return self._logger

    @property
    def inp(self):
        ''':class:`lost.pyapi.inout.Input`
        '''
        return self._inp #type: inout.Input

    @property
    def outp(self):
        ''':class:`lost.pyapi.inout.ScriptOutput`
        '''
        return self._outp #type: inout.ScriptOutput

    def get_label_tree(self, name):
        '''Get a LabelTree by name.
        
        Args:
            name (str): Name of the desired LabelTree.
        
        Retruns:
            :class:`lost.logic.label.LabelTree` or None: 
                If a label tree with the given name exists 
                it will be returned. Otherwise None
                will be returned'''
        group_id = self._pipe.group_id
        root_list = self._dbm.get_all_label_trees(group_id, add_global=True)
        root = next(filter(lambda x: x.name==name, root_list), None)
        if root is None:
            return None
        else:
            return LabelTree(self._dbm, root_leaf=root)

    def create_label_tree(self, name, external_id=None):
        '''Create a new LabelTree
        
        Args:
            name (str): Name of the tree / name of the root leaf.
            external_id (str): An external id for the root leaf.
        
        Returns:
            :class:`lost.logic.label.LabelTree`:
                The created LabelTree.
        '''
        tree = LabelTree(self._dbm)
        tree.create_root(name, external_id=external_id)
        return tree

    def break_loop(self):
        '''Break next loop in pipeline.
        '''
        loop_e = self._pipe_man.get_next_loop(self._pipe_element)
        if loop_e is not None:
            loop_e.loop.break_loop = True
        self._dbm.add(loop_e)
        self._dbm.commit()

    def loop_is_broken(self):
        '''Check if the current loop is broken'''
        loop_e = self._pipe_man.get_next_loop(self._pipe_element)
        if loop_e is not None:
            return loop_e.loop.break_loop
        else:
            self.logger.warning('loop_is_broken method was used, but no loop seems to be in this pipeline!')
            return False

    def get_arg(self, arg_name):
        '''Get argument value by name for this script.

        Args:
            arg_name (str): Name of the argument.

        Returns:
            Value of the given argument.
        '''
        if self._pipe_element.arguments:
            args = json.loads(self._pipe_element.arguments)
            # args = ast.literal_eval(self._pipe_element.arguments)
            my_arg = args[arg_name]['value']
            if my_arg in ['t', 'true', 'yes']:
                return True
            if my_arg in ['f', 'false', 'no']:
                return False
            if my_arg in ['-', '', '[]']:
                return None
            try:
                return ast.literal_eval(my_arg)
            except:
                return my_arg
                
        else:
            return None

    def get_fs(self, name=None):
        '''Get default lost filesystem or a specific filesystem by name.

        Returns:
            fsspec.spec.AbstractFileSystem: See https://filesystem-spec.readthedocs.io/en/latest/api.html#fsspec.spec.AbstractFileSystem
        '''
        if name is None:
            return self.ufa.fs
        return self.ufa.get_fs(name)

    def get_path(self, file_name, context='instance'):
        '''Get path for the filename in a specific context in filesystem.

        Args:
            file_name (str): Name or relative path for a file.
            context (str): Options: *instance*, *pipe*

        Returns:
            str: Absolute path to the file in the specified context.
        '''
        if context == 'instance':
            path = os.path.join(self.ufa.get_instance_path(self._pe), file_name)
        elif context == 'pipe':
            path = os.path.join(self.ufa.get_pipe_context_path(self._pe), file_name)
        else:
            raise Exception('Unknown context: {}. Should be *instance* or *pipe*!'.format(context))
        return path

    @property
    def iteration(self):
        '''int: Get the current iteration.

        Number of times this script has been executed.
        '''
        return self._pipe_element.iteration

    @property
    def progress(self):
        '''float: Get current progress that is displayed in the progress bar of this script.

        Current progress in percent 0...100
        '''
        return self._pipe_element.progress

    def update_progress(self, value):
        '''Update the progress for this script.

        Args:
            value (float): Progress in percent 0...100
        '''
        self._pipe_element.progress = value
        self._dbm.commit()

    def reject_execution(self):
        '''Reject execution of this script and set it to PENDING again.

        Note:
            This method is useful if you want to execute this script only
            when some condition based on previous pipeline elements is 
            meet.
        '''
        self.rejected_execution = True

    def get_alien_element(self, pe_id):
        '''Get an pipeline element by id from somewhere in the LOST system.

        It is an alien element since it is most likely not part of the 
        pipeline instance this script belongs to.

        Args:
            pe_id (int): PipeElementID of the alien element.
        
        Returns:
            * :class:`lost.pyapi.script.Script`
            * :class:`lost.pyapi.pipe_elements.AnnoTask`
            * :class:`lost.pyapi.pipe_elements.Datasource`
            * :class:`lost.pyapi.pipe_elements.VisualOutput`
            * :class:`lost.pyapi.pipe_elements.DataExport`
            * :class:`lost.pyapi.pipe_elements.Loop`

        '''
        pe = self.dba.get_alien(pe_id)

        if pe.dtype == dtype.PipeElement.SCRIPT:
            return Script(pe_id=pe_id)
        elif pe.dtype == dtype.PipeElement.ANNO_TASK:
            return pipe_elements.AnnoTask(pe, self._dbm)
        elif pe.dtype == dtype.PipeElement.DATASOURCE:
            return pipe_elements.Datasource(pe, self._dbm)
        elif pe.dtype == dtype.PipeElement.VISUALIZATION:
            return pipe_elements.VisualOutput(pe, self._dbm)
        elif pe.dtype == dtype.PipeElement.DATA_EXPORT:
            return pipe_elements.DataExport(pe, self._dbm)
        elif pe.dtype == dtype.PipeElement.LOOP:
            return pipe_elements.Loop(pe, self._dbm)
        else:
            raise Exception('Unknown pipe element type!')

    def i_am_done(self):
        if self.rejected_execution:
            self._pipe_element.state = state.PipeElement.PENDING
            self._dbm.add(self._pipe)
            self._dbm.add(self._pipe_element)
            self._dbm.commit()
            return            

        #Save all changes to database
        if self._pipe_element.is_debug_mode == False:
            self._pipe_element.state = state.PipeElement.FINISHED
            self._pipe_element.progress = 100.0
            self._pipe.state = state.Pipe.IN_PROGRESS
            self._dbm.add(self._pipe)
            self._dbm.add(self._pipe_element)
            self._dbm.commit()
        else:
            answer = input("Have you finished debugging? [y/n]: ")
            if answer[0].lower() == 'y':
                self._pipe_element.state = state.PipeElement.FINISHED
                self._pipe_element.progress = 100.0
                self._pipe.state = state.Pipe.IN_PROGRESS
                self._dbm.add(self._pipe)
                self._dbm.add(self._pipe_element)
            else:
                self.outp.clean_up()
            self._pipe_man.pipe.state = state.Pipe.IN_PROGRESS
            self._dbm.commit()
        self._log_stream.close()

    def report_err(self, msg):
        '''Report an error for this user script to portal

        Args:
            msg: The error message that should be reported.

        Note:
            You can call this method multiple times if you like. All messages
            will be concatenated an sent to the portal.
        '''
        self.logger.error(msg)
        report_script_err(self._pipe_element, self._pipe, self._dbm, msg)