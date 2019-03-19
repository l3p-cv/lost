'''
A modul for basic interaction of custom scripts with the portal.
'''
__author__ = 'Jonas Jäger'

from lost.db import access
from lost.db import dtype, state
from lost.logic.file_man import FileMan
from lost.logic import log
from lost.pyapi import inout
import argparse
import datetime
import traceback
import os
from lost.logic.config import LOSTConfig
import json
import pickle
from lost.pyapi import pe_base
from lost.logic.label import LabelTree

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
            in order to emulate this script in a jupyter notebook.
    '''
    def __init__(self, pe_id=None):
        if pe_id is None:
            parser = argparse.ArgumentParser(description='A user defined script.')
            parser.add_argument('--idx', nargs='?', action='store',
                                help='Id of related pipeline element.')
            args = parser.parse_args()
        lostconfig = LOSTConfig()
        self.file_man = FileMan(lostconfig)
        dbm = access.DBMan(lostconfig)
        self._dbm = dbm #type: lost.db.access.DBMan
        if pe_id is None:
            pe = dbm.get_pipe_element(int(args.idx))
        else:
            pe = dbm.get_pipe_element(pe_id)
        super().__init__(pe, dbm)
        logfile_path = self.file_man.get_pipe_log_path(self._pipe.idx)
        self.logger = log.get_file_logger(os.path.basename(pe.script.path),
                                          logfile_path)
        if self.pipe_info.logfile_path is None or not self.pipe_info.logfile_path:
            self.pipe_info.logfile_path = self.get_rel_path(logfile_path)
        self._inp = inout.Input(self)
        self._outp = inout.ScriptOutput(self)
        self.rejected_execution = False
        # If pe_id is None we have a normal script
        # If pe_id is not None a JupyterNotebook uses this script
        if pe_id is None:
            try:
                self.main()
                self.i_am_done()
            except:
                err_msg = str(datetime.datetime.now()) + '\n'
                err_msg += traceback.format_exc()
                self.report_err(err_msg)
    
    def __str__(self):
        my_str = 'I am a Script.\nMy name is: {}\nPipeElementID: {}'.format(self._pipe_element.script.name, 
                                                                            self._pipe_element.idx)
        return my_str

    def main(self):
        #raise NotImplementedError("You need to implement a main method to get your Script running.")
        pass

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

    def get_rel_path(self, path):
        '''Get relativ path for current project

        Args:
            path (str): A absolute path

        Returns:
            str : Relative path
        '''
        return self.file_man.get_rel_path(path)

    def get_label_tree(self, name):
        '''Get a LabelTree by name.
        
        Args:
            name (str): Name of the desired LabelTree.
        
        Retruns:
            :class:`lost.logic.label.LabelTree` or None: 
                If a label tree with the given name exists 
                it will be returned. Otherwise None
                will be returned'''
        root_list = self._dbm.get_all_label_trees()
        root = next(filter(lambda x: x==name, root_list), None)
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

    def get_abs_path(self, path):
        '''Get absolute path in current file system.

        Args:
            path (str): A relative path.

        Returns:
            str: Absolute path
        '''
        return self.file_man.get_abs_path(path)

    def break_loop(self):
        '''Break next loop in pipeline.
        '''
        loop_e = self._pipe_man.get_next_loop(self._pipe_element)
        if loop_e is not None:
            loop_e.loop.break_loop = True
        self._dbm.add(loop_e)

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
            return args[arg_name]['value']
        else:
            return None

    def get_path(self, file_name, context='instance', ptype='abs'):
        '''Get path for the filename in a specific context in filesystem.

        Args:
            file_name (str): Name or relative path for a file.
            context (str): Options: *instance*, *pipe*, *static*:
            ptype (str): Type of this path. Can be relative or absolute
                Options: *abs*, *rel*

        Returns:
            str: Path to the file in the specified context.
        '''
        if context == 'instance':
            path = os.path.join(self.instance_context, file_name)
        elif context == 'pipe':
            path = os.path.join(self.pipe_context, file_name)
        elif context == 'static':
            path = os.path.join(self.static_context, file_name)
        else:
            raise Exception('Unknown context: {}'.format(context))
        if ptype == 'abs':
            return path
        elif ptype == 'rel':
            return self.get_rel_path(path)
        else:
            raise Exception('Unknown argument ptype: {}'.format(ptype))

    @property
    def iteration(self):
        '''Get the current iteration.

        Returns:
            Number of times this script has been executed.
        '''
        return self._pipe_element.iteration

    @property
    def instance_context(self):
        '''Get the path to store files that are only valid for this instance.

        Returns:
            str: path
        '''
        abs_path = self.file_man.create_instance_path(self._pipe_element)
        rel_path = self.file_man.make_path_relative(abs_path)
        self._pipe_element.instance_context = rel_path
        self._dbm.add(self._pipe_element)
        return abs_path

    @property
    def pipe_context(self):
        '''str: Root path to store files that should be visible for all elements
        in the pipeline.
        '''
        return self.file_man.get_pipe_context_path(self._pipe_element)

    @property
    def static_context(self):
        '''Get a path that is always valid for this script.

        Files that are stored at this path can be accessed by all instances of a
        script.

        Returns:
            str: static context path.
        '''
        return os.path.join(self._lostconfig.project_path,
                            os.path.split(self._pipe_element.script.path)[0])

    @property
    def progress(self):
        '''Get current progress that is displayed in the progress bar of this script.

        Returns:
            float: Current progress in percent 0...100
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