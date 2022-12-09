from datetime import datetime, time
#from py3nvml.py3nvml import *
import sys
from lost.db import model, state, dtype
import json
import lost
from lost.logic.pipeline import pipe_model
import os
import shutil
from lost.logic.file_man import FileMan, AppFileMan
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
# from celery.utils.log import get_task_logger
# from celery import task
from lost.db.access import DBMan
from lostconfig import LOSTConfig
from lost.logic.pipeline.worker import WorkerMan, CurrentWorker
from lost.logic import email
from lost.logic.dask_session import ds_man, ppp_man
from lost.logic.pipeline import exec_utils

def gen_extra_install_cmd(extra_packages, lostconfig):
    def cmd(install_cmd, packages):
        return f'{install_cmd} {packages}'
    extra = json.loads(extra_packages)
    pip_cmd = None
    if lostconfig.allow_extra_pip:
        if len(extra['pip']) > 1:
            pip_cmd = cmd('pip install', extra['pip'])
    conda_cmd = None
    if lostconfig.allow_extra_conda:
        if len(extra['conda']) > 1:
            conda_cmd = cmd('conda install', extra['conda'])
    return pip_cmd, conda_cmd
class PipeEngine(pipe_model.PipeEngine):
    def __init__(self, dbm, pipe, lostconfig, client, logger_name=''):
        '''
        :type dbm: lost.db.access.DBMan
        :type pipe: lost.db.model.Pipe
        '''
        super().__init__(dbm=dbm, pipe=pipe)
        self.lostconfig = lostconfig #type: lost.logic.config.LOSTConfig
        self.file_man = AppFileMan(self.lostconfig)
        # self.logger = lost.logic.log.get_file_logger(
        #     'Executor: {}'.format(self.lostconfig.env_name), 
        #     self.file_man.get_app_log_path('PipeEngine.log'))
        # self.logger = get_task_logger(__name__)
        self.logger = logging.getLogger('{}.{}'.format(
            logger_name, self.__class__.__name__)
        )
        self.client = client

    def process_annotask(self, pipe_e):
        anno_task = self.dbm.get_anno_task(pipe_element_id=pipe_e.idx)
        if anno_task.state == state.AnnoTask.IN_PROGRESS or \
           anno_task.state == state.AnnoTask.PAUSED:
           if not at_man.has_annotation_in_iteration(self.dbm, anno_task.idx, pipe_e.iteration):
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
        script_path = os.path.join(self.lostconfig.app_path, pipe_e.script.path)
        cmd = self.lostconfig.py3_init + " && "
        cmd += program + " " + script_path + " --idx " + str(pipe_e.idx) 
        return cmd

    def make_debug_session(self, pipe_e):
        debug_path = self.file_man.create_debug_path(pipe_element=pipe_e)
        debug_file_path = os.path.join(debug_path, 'debug.sh')
        # init = self.lostconfig.py3_init + '\n'
        cmd = self.__gen_run_cmd('pudb', pipe_e)
        # script_content = init + cmd
        script_content = cmd
        with open(debug_file_path, 'w') as dfile:
            dfile.write(script_content)
        script_path = os.path.join(self.lostconfig.app_path, pipe_e.script.path)
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
        
    def select_env_for_script(self, pipe_e):
        '''Select an environment where the script should be executed'''
        w_man = WorkerMan(self.dbm, self.lostconfig)
        if pipe_e.script.envs is not None:
            script_envs = json.loads(pipe_e.script.envs)
            if len(script_envs) == 0:
                return 'lost'
        else:
            script_envs = list()
            return 'lost' # Return default queue
        worker_envs = w_man.get_worker_envs()        
        for script_env in script_envs:
            if script_env in worker_envs:
                return script_env
        self.logger.warning('No suitable env to execute script: {}'.format(pipe_e.script.path))
        return None 

    def dask_done_callback(self, fut):
        self.logger.info(f'fut.done: {fut.done()}')
        self.logger.info(f'fut.cancelled: {fut.cancelled()}')
        exc = fut.exception()
        if exc is None:
            self.logger.info(fut.result())
        else:
            self.logger.info(f'exception:\n{fut.exception()}')
            self.logger.error('traceback:\n{}'.format(
                ''.join(
                    [f'{x}' for x in traceback.format_tb(fut.traceback())]
                )
            ))
        # class User():
        #     def __init__(self, idx):
        #         self.idx = idx

        # # client = ds_man.get_dask_client(User(1))
        # self.logger.info(f'shutdown cluster: {ds_man.shutdown_cluster(User(1))}')
        # self.logger.info(f'client.restart: {client.restart()}')

    def _install_extra_packages(self, client, packages):
        def install(cmd):
            import subprocess
            output = subprocess.check_output(f'{cmd}',stderr=subprocess.STDOUT, shell=True)
            return output
            # import os
            # os.system(f'{install_cmd} {packages}')
        pip_cmd, conda_cmd = gen_extra_install_cmd(packages, self.lostconfig)
        if pip_cmd is not None:
            self.logger.info(f'Start install cmd: {pip_cmd}')
            self.logger.info(client.run(install, pip_cmd))
            self.logger.info(f'Install finished: {pip_cmd}')
        if conda_cmd is not None:
            self.logger.info(f'Start install cmd: {conda_cmd}')
            self.logger.info(client.run(install, conda_cmd))
            self.logger.info(f'Install finished: {conda_cmd}')

    def exec_dask_direct(self, client, pipe_e, worker=None):
        scr = pipe_e.script
        self._install_extra_packages(client, scr.extra_packages)
        # extra_packages = json.loads(scr.extra_packages)
        # if self.lostconfig.allow_extra_pip:
        #     self._install_extra_packages(client, 'pip install', extra_packages['pip'])
        # if self.lostconfig.allow_extra_conda:
        #     self._install_extra_packages(client, 'conda install', extra_packages['conda'])
        pp_path = self.file_man.get_pipe_project_path(pipe_e.script)
        # self.logger.info('pp_path: {}'.format(pp_path))
        # timestamp = datetime.now().strftime("%m%d%Y%H%M%S")
        # packed_pp_path = self.file_man.get_packed_pipe_path(
        #     f'{os.path.basename(pp_path)}.zip', timestamp
        # )
        # self.logger.info('packed_pp_path: {}'.format(packed_pp_path))
        # if ppp_man.should_i_update(client, pp_path):
        #     exec_utils.zipdir(pp_path, packed_pp_path, timestamp)
        #     self.logger.info(f'Upload file:{client.upload_file(packed_pp_path)}')
        # import_name = exec_utils.get_import_name_by_script(
        #     pipe_e.script.name, timestamp)
        # self.logger.info(f'import_name:{import_name}')
        import_name = ppp_man.prepare_import(
            client, pp_path, pipe_e.script.name, self.logger
        )
        fut = client.submit(exec_utils.exec_dyn_class, pipe_e.idx, 
            import_name, workers=worker
        )
        fut.add_done_callback(self.dask_done_callback)

    def start_script(self,pipe_e):
        if self.client is not None: # Workermanagement == static
            env = self.select_env_for_script(pipe_e)
            if env is None:
                return
            # celery_exec_script.apply_async(args=[pipe_e.idx], queue=env)
            worker = env
            client = self.client
        else:
            # If client is None, try to get client form dask_session
            user = self.dbm.get_user_by_id(self.pipe.manager_id)
            client = ds_man.get_dask_client(user)
            ds_man.refresh_user_session(user)
            self.logger.info('Process script with dask client: {}'.format(client))
            self.logger.info('dask_session: {}'.format(ds_man.session))
            # logger.info('pipe.manager_id: {}'.format(p.manager_id))
            # logger.info('pipe.name: {}'.format(p.name))
            # logger.info('pipe.group_id: {}'.format(p.group_id))
            worker = None
            # client.submit(exec_script_in_subprocess, pipe_e.idx)
        if self.lostconfig.script_execution == 'subprocess':
            fut = client.submit(exec_script_in_subprocess, pipe_e.idx, workers=worker)
            fut.add_done_callback(self.dask_done_callback)
        else:
            self.exec_dask_direct(client, pipe_e, worker)

    def process_pipe_element(self):
        pipe_e = self.get_next_element()
        while (pipe_e is not None):
            # if pipe_e is None:
            #     return
            if pipe_e.dtype == dtype.PipeElement.SCRIPT:
                if pipe_e.state != state.PipeElement.SCRIPT_ERROR:
                    # if pipe_e.is_debug_mode:
                    #     pipe_e.state = state.PipeElement.IN_PROGRESS
                    #     self.dbm.save_obj(pipe_e)
                    #     self.make_debug_session(pipe_e)
                    # else:
                    if pipe_e.state == state.PipeElement.PENDING:
                        self.start_script(pipe_e)
                        pipe = pipe_e.pipe
                        self.logger.info('PipeElementID: {} Excuting script: {}'.format(pipe_e.idx, 
                            pipe_e.script.name))
            elif pipe_e.dtype == dtype.PipeElement.ANNO_TASK:
                if pipe_e.state == state.PipeElement.PENDING:
                    update_anno_task(self.dbm, pipe_e.anno_task.idx)
                    try: 
                        email.send_annotask_available(self.dbm, pipe_e.anno_task)
                    except:
                        msg = "Could not send Email. \n"
                        msg += traceback.format_exc()
                        self.logger.error(msg)
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

    def refesh_dask_user_session(self):
        if self.client is None:
            user = self.dbm.get_user_by_id(self.pipe.manager_id)
            ds_man.refresh_user_session(user)
            # self.logger.info('Refreshed dask user session for user: {}'.format(user.idx))

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
                self.refesh_dask_user_session()
                p.state = state.Pipe.IN_PROGRESS
                self.dbm.save_obj(p)
                self.process_pipe_element()
            elif p.state == state.Pipe.IN_PROGRESS:
                self.refesh_dask_user_session()
                self.process_pipe_element()
            elif p.state == state.Pipe.FINISHED:
                return
            elif p.state == state.Pipe.ERROR:
                self.__report_error(p)
            else:
                raise Exception("Unknown PipeState!")
            p.is_locked = False
            self.dbm.save_obj(p)
        except:
            p.is_locked = False
            self.dbm.save_obj(p)
            raise

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
                    try: 
                        email.send_pipeline_finished(self.pipe)
                    except:
                        msg = "Could not send Email. \n"
                        msg += traceback.format_exc()
                        self.logger.error(msg)
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

    def __report_error(self, pipe):
        for pipe_element in self.dbm.get_script_errors(pipe.idx):
            # Send mail to inform user about script error.
            try:
                email.send_script_error(pipe, pipe_element)
                pipe_element.error_reported = True
                self.dbm.add(pipe_element)
                self.dbm.commit()    
            except:
                pipe_element.error_reported = True
                pipe_element.error_msg +=  traceback.format_exc()
                self.dbm.add(pipe_element)
                self.dbm.commit()    

def gen_run_cmd(program, pipe_e, lostconfig):
    # script = self.dbm.get_script(pipe_e.script_id)
    cmd = lostconfig.py3_init + "\n"
    # extra_packages = json.loads(pipe_e.script.extra_packages)
    pip_cmd, conda_cmd = gen_extra_install_cmd(pipe_e.script.extra_packages, lostconfig)
    if pip_cmd is not None:
        cmd += pip_cmd + '\n'
    if conda_cmd is not None:
        cmd += conda_cmd +'\n'
    script_path = os.path.join(lostconfig.app_path, pipe_e.script.path)
    cmd += program + " " + script_path + " --idx " + str(pipe_e.idx) 
    return cmd

def exec_script_in_subprocess(pipe_element_id):
    try:
        lostconfig = LOSTConfig()
        dbm = DBMan(lostconfig)
        pipe_e = dbm.get_pipe_element(pipe_e_id=pipe_element_id)
        logger = logging
        if lostconfig.worker_management == 'static':
            worker = CurrentWorker(dbm, lostconfig)
            if not worker.enough_resources(pipe_e.script):
                # logger.warning('Not enough resources! Rejected {} (PipeElement ID {})'.format(pipe_e.script.path, pipe_e.idx))
                raise Exception('Not enough resources')
        pipe_e.state = state.PipeElement.IN_PROGRESS
        dbm.save_obj(pipe_e)
        file_man = AppFileMan(lostconfig)
        pipe = pipe_e.pipe

        cmd = gen_run_cmd("pudb", pipe_e, lostconfig)
        debug_script_path = file_man.get_debug_path(pipe_e)
        debug_script_path = os.path.join(debug_script_path, 'debug.sh')
        with open(debug_script_path, 'w') as sfile:
            sfile.write(cmd)

        cmd = gen_run_cmd("python3", pipe_e, lostconfig)
        # file_man.create_debug_path(pipe_e)
        start_script_path = file_man.get_debug_path(pipe_e)
        start_script_path = os.path.join(start_script_path, 'start.sh')
        with open(start_script_path, 'w') as sfile:
            sfile.write(cmd)
        p = subprocess.Popen('bash {}'.format(start_script_path), stdout=subprocess.PIPE,
            stderr=subprocess.PIPE, shell=True)
        logger.info("{} ({}): Started script\n{}".format(pipe.name, pipe.idx, cmd))
        if lostconfig.worker_management == 'static':
            worker.add_script(pipe_e, pipe_e.script)       
        out, err = p.communicate()
        if lostconfig.worker_management == 'static':
            worker.remove_script(pipe_e, pipe_e.script)       
        if p.returncode != 0:
            raise Exception(err.decode('utf-8'))
        logger.info('{} ({}): Executed script successful: {}'.format(pipe.name, 
            pipe.idx, pipe_e.script.path))
        dbm.close_session()

    except:
        pipe = pipe_e.pipe
        logger.info('{} ({}): Exception occurred in script: {}'.format(pipe.name, 
            pipe.idx, pipe_e.script.path))
        msg = traceback.format_exc()
        logger.error(msg)
        script_api.report_script_err(pipe_e, pipe, dbm, msg)
        dbm.close_session()

