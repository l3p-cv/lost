from datetime import datetime
#from py3nvml.py3nvml import *
import sys
from lost.db import model, state, dtype
import json
import lost
from lost.logic.pipeline import pipe_model
import os
import shutil
from lost.logic.file_man import FileMan
from lost.logic import anno_task as at_man
from lost.pyapi import script as script_api
import subprocess
from lost.logic import script as script_man
from lost.logic.anno_task import update_anno_task
from distutils import dir_util
import importlib
import traceback
import lost.logic.log
import logging
from celery.utils.log import get_task_logger


class PipeEngine(pipe_model.PipeEngine):
    def __init__(self, dbm, pipe, lostconfig):
        '''
        :type dbm: lost.db.access.DBMan
        :type pipe: lost.db.model.Pipe
        '''
        super().__init__(dbm=dbm, pipe=pipe)
        self.lostconfig = lostconfig #type: lost.logic.config.LOSTConfig
        self.file_man = FileMan(self.lostconfig)
        # self.logger = lost.logic.log.get_file_logger(
        #     'Executor: {}'.format(self.lostconfig.executor), 
        #     self.file_man.app_log_path)
        self.logger = get_task_logger(__name__)

    def process_annotask(self, pipe_e):
        anno_task = self.dbm.get_anno_task(pipe_element_id=pipe_e.idx)
        if anno_task.state == state.AnnoTask.IN_PROGRESS or \
           anno_task.state == state.AnnoTask.PAUSED:
           if not at_man.has_annotation(self.dbm, anno_task.idx):
                at_man.set_finished(self.dbm, anno_task.idx)
                self.logger.warning('No Annotations have been requested for AnnoTask {}'\
                    .format(anno_task.idx))
                self.logger.warning("%d: AnnoTask has been finished (ID: %d, Name: %s)"\
                                %(self.pipe.idx, anno_task.idx, anno_task.name))
            # if pipe_e.anno_task.dtype == dtype.AnnoTask.MIA:
            #     if anno_task.progress is None:
            #         anno_task.progress = 0.0
            #     if anno_task.progress >= 100.0:
            #          anno_task.state = state.AnnoTask.FINISHED
            #          self.dbm.add(anno_task)
            #          pipe_e.state = state.PipeElement.FINISHED
            #          self.dbm.add(pipe_e)
            #          self.dbm.commit()
            #          print("%d: AnnoTask has been finished (ID: %d, Name: %s)"\
            #                       %(self.pipe.idx, anno_task.idx, anno_task.name))
            #     else:
            #         return
       
        # state = finished will be set in annotation tool
        if anno_task.state == state.AnnoTask.PENDING:
            anno_task.state = state.AnnoTask.IN_PROGRESS
            self.dbm.save_obj(anno_task)
            self.logger.info("%d: AnnoTask IN_PROGRESS (ID: %d, Name: %s)"\
                         %(self.pipe.idx, anno_task.idx, anno_task.name))

    def __gen_run_cmd(self, program, pipe_e):
        # script = self.dbm.get_script(pipe_e.script_id)
        script_path = os.path.join(self.lostconfig.project_path, pipe_e.script.path)
        cmd = self.lostconfig.py3_init + " && "
        cmd += program + " " + script_path + " --idx " + str(pipe_e.idx) 
        return cmd

    def exec_script(self, pipe_e):
        try:
            #try to import script before execution to catch import errors, 
            #inconsistent use of tabs, etc. 
            script_path = os.path.join(self.lostconfig.project_path, pipe_e.script.path)
            cmd_check = 'bash /code/backend/lost/logic/pipeline/check_script.sh {} "{}"'.format(
                script_path, self.lostconfig.py3_init)
            self.logger.info('cmd_check: {}'.format(cmd_check))
            p = subprocess.Popen(cmd_check, stdout=subprocess.PIPE,
                stderr=subprocess.PIPE, shell=True)
            out, err = p.communicate()
            if p.returncode != 0:
                raise Exception(err.decode('utf-8'))

            cmd = self.__gen_run_cmd("python3", pipe_e)
            start_script_path = self.file_man.get_instance_path(pipe_e)
            start_script_path = os.path.join(start_script_path, 'start.sh')
            with open(start_script_path, 'w') as sfile:
                sfile.write(cmd)
            p = subprocess.Popen('bash {}'.format(start_script_path), stdout=subprocess.PIPE, shell=True)
            self.logger.info("{}: Started script\n{}".format(self.pipe.idx, cmd))
        except:
            self.logger.error('{}: Could not start script: {}'.format(self.pipe.idx,
                                                                   pipe_e.script.path))
            msg = traceback.format_exc()
            self.logger.error(msg)
            script_api.report_script_err(pipe_e, self.pipe, self.dbm, msg)

    def make_debug_session(self, pipe_e):
        debug_path = self.file_man.create_debug_path(pipe_element=pipe_e)
        debug_file_path = os.path.join(debug_path, 'debug.sh')
        # init = self.lostconfig.py3_init + '\n'
        cmd = self.__gen_run_cmd('pudb3', pipe_e)
        # script_content = init + cmd
        script_content = cmd
        with open(debug_file_path, 'w') as dfile:
            dfile.write(script_content)
        script_path = os.path.join(self.lostconfig.project_path, pipe_e.script.path)
        dsession_str = "For DEBUG start: bash " + debug_file_path
        dsession_str += "<br>If you want to EDIT go to: " + script_path
        pipe_e.debug_session = dsession_str
        self.dbm.save_obj(pipe_e)
        self.logger.info('Created debug script: {}'.format(debug_file_path))
        self.logger.info(pipe_e.debug_session)

    def __release_loop_iteration(self, pipe_e):
        pipe_e.loop.iteration += 1
        self.logger.info('{}: Run loop with id {} in iteration {}'.format(self.pipe.idx,
                                                                      pipe_e.loop.idx,
                                                                      pipe_e.loop.iteration))
        loop_pes = self.get_loop_pes(pipe_e.loop.pe_jump, pipe_e)
        for pe in loop_pes:
            pe.iteration += 1
            pe.state = state.PipeElement.PENDING
            if pe.dtype == dtype.PipeElement.ANNO_TASK:
                pe.anno_task.state = state.AnnoTask.PENDING
            elif pe.dtype == dtype.PipeElement.SCRIPT:
                pe.progress = 0.0
            elif pe.dtype == dtype.PipeElement.LOOP:
                # Check for loop in loop case; Set iteration of all inner loops
                # to zero.
                if pe is not pipe_e:
                    pe.loop.iteration = 0
            self.set_to_visit(pe)
            self.dbm.add(pe)

    def process_loop(self, pipe_e):
        if pipe_e.loop.break_loop:
            pipe_e.state = state.PipeElement.FINISHED
            self.dbm.add(pipe_e)
            self.logger.info('{}: Break loop with id {}'.format(self.pipe.idx,
                                                            pipe_e.loop.idx))
            return
        if pipe_e.loop.max_iteration is not None:
            if pipe_e.loop.iteration is None:
                pipe_e.loop.iteration = 0
            if pipe_e.loop.iteration < pipe_e.loop.max_iteration-1:
                self.__release_loop_iteration(pipe_e)
            else:
                pipe_e.state = state.PipeElement.FINISHED
                self.logger.info('{}: Loop ({}) terminated. Max iterations = {}'\
                             .format(self.pipe.idx, pipe_e.loop.idx,
                                     pipe_e.loop.max_iteration))
        else:
            self.__release_loop_iteration(pipe_e)
        self.dbm.add(pipe_e)

    def gpu_or_not(self, threshold=0.9):
        '''Check if there is a Free GPU or no GPU.

        If GPU has more free memory than threshold return true.
        If there is no GPU return true.

        Args:
            threshold (float): If there is a GPU it needs to have more free memory
                than threshold in oder to return true.
        Note:
            This is not the best solution. There need to be more resource 
            management!
        '''
        '''try:
            nvmlInit()
            print("GPU: Driver Version: {}".format(nvmlSystemGetDriverVersion()))
            deviceCount = nvmlDeviceGetCount()
            for i in range(deviceCount):
                handle = nvmlDeviceGetHandleByIndex(i)
                print("GPU: Device {}: {}".format(i, nvmlDeviceGetName(handle)))
                info = nvmlDeviceGetMemoryInfo(handle)
                free = info.free/info.total
                print('GPU: Free memory: {:.2f}%'.format(free))
                if free > threshold:
                    nvmlShutdown()
                    return True
            nvmlShutdown()
            return False
        except:
            return True '''
        #TODO: Uncomment this fancy stuff here and install dependencies (NVML) to docker!
        return True
        

    def process_pipe_element(self):
        pipe_e = self.get_next_element()
        while (pipe_e is not None):
            # if pipe_e is None:
            #     return
            if pipe_e.dtype == dtype.PipeElement.SCRIPT:
                if pipe_e.state != state.PipeElement.SCRIPT_ERROR:
                    if pipe_e.script.executors is not None:
                        executors = json.loads(pipe_e.script.executors)
                    else:
                        executors = list()
                    current_execu = self.lostconfig.executor.lower()
                    if not executors or current_execu in executors:
                        if pipe_e.is_debug_mode:
                            pipe_e.state = state.PipeElement.IN_PROGRESS
                            self.dbm.save_obj(pipe_e)
                            self.make_debug_session(pipe_e)
                        else:
                            if pipe_e.state == state.PipeElement.PENDING:
                                if self.gpu_or_not():
                                    pipe_e.state = state.PipeElement.IN_PROGRESS
                                    self.dbm.save_obj(pipe_e)
                                    self.exec_script(pipe_e)
            elif pipe_e.dtype == dtype.PipeElement.ANNO_TASK:
                if pipe_e.state == state.PipeElement.PENDING:
                    #TODO : implement update anno task after big bang in anno task logic!
                    # Recalculate progress of Annotask
                    # before bigbang update method call :
                    update_anno_task(self.dbm, pipe_e.anno_task.idx)
                    #raise NotImplementedError("UPDATE ANNO TASK NOT IMPLEMENTED YET - I TOLD YOU !")
                    #pass
                pipe_e.state = state.PipeElement.IN_PROGRESS
                self.dbm.save_obj(pipe_e)
                self.process_annotask(pipe_e)
            elif pipe_e.dtype == dtype.PipeElement.DATASOURCE:
                pipe_e.state = state.PipeElement.FINISHED
                self.dbm.save_obj(pipe_e)
            elif pipe_e.dtype == dtype.PipeElement.VISUALIZATION:
                pipe_e.state = state.PipeElement.FINISHED
                self.dbm.save_obj(pipe_e)
            elif pipe_e.dtype == dtype.PipeElement.DATA_EXPORT:
                pipe_e.state = state.PipeElement.FINISHED
                self.dbm.save_obj(pipe_e)
            elif pipe_e.dtype == dtype.PipeElement.LOOP:
                self.process_loop(pipe_e)
                self.dbm.commit()
            pipe_e = self.get_next_element()

    def process_pipeline(self):
        try:
            p = self.pipe
            # print('Process pipe: {}'.format(self.pipe.name))
            if p.is_locked is None:
               p.is_locked = False
            if not p.is_locked:
                p.is_locked = True
                self.dbm.save_obj(p)
            else:
                return
            if p.state == state.Pipe.PENDING:
                p.state = state.Pipe.IN_PROGRESS
                self.dbm.save_obj(p)
                self.process_pipe_element()
            elif p.state == state.Pipe.IN_PROGRESS:
                self.process_pipe_element()
            elif p.state == state.Pipe.FINISHED:
                return
            else:
                raise Exception("Unknown PipeState!")
            p.is_locked = False
            self.dbm.save_obj(p)
        except:
            p.is_locked = False
            self.dbm.save_obj(p)
            raise

    # def process_paths(self):
    #     for path in self.get_all_paths():
    #         self.current_path = path
    #         self.process_next_path_element()

    ''' def process_next_path_element(self):
        pe = self.get_pe_to_start(self.current_path)
        self.process_pipe_element(pe) '''

    def get_next_element(self):
        pe_wait = None
        for candidate in self.get_to_visit():
            if candidate is None:
                if self.pipe_finished():
                    self.pipe.state = state.Pipe.FINISHED
                    self.pipe.timestamp_finished = datetime.now()
                    self.dbm.save_obj(self.pipe)
                    self.logger.info("%d: Task is finished (Name: %s)"%(self.pipe.idx,
                                                                    self.pipe.name))
                    return None
                else:
                    continue
            else:
                pe = self.check_candiate(candidate)
                if pe is None:
                    continue
                #If there is a loop under candidates, it should be executed as
                #last possible element. Since a loop will set all other elements
                #within the loop to pending when processed. So if the last element
                #before the loop has subsequent elements. These elements would never
                #be executed since the loop would set the last element in the loop
                #to pending.
                elif pe.dtype == dtype.PipeElement.LOOP:
                    pe_wait = pe
                    continue
                else:
                    self.set_visited(pe)
                    return pe
        return pe_wait

    def pipe_finished(self):
        for pe in self.get_final_pes():
            if pe.state != state.PipeElement.FINISHED:
                return False
        return True

    def check_candiate(self, candidate):
        # If all prev elements are finished return candidate
        for pe_prev in self.get_prev_pes(candidate):
            if pe_prev is not None:
                if pe_prev.state != state.PipeElement.FINISHED:
                    return None
                # if pe_prev.state == state.PipeElement.FINISHED:
                #     if candidate.state == state.PipeElement.PENDING:
                #         return candidate
                #     elif candidate.dtype == dtype.PipeElement.ANNOTATION_TASK and\
                #         candidate.state == state.PipeElement.IN_PROGRESS:
                #         return candidate
            else:
                # if pe_prev is None and candidate.state == PENDING
                if candidate.state == state.PipeElement.PENDING:
                    return candidate
        return candidate


