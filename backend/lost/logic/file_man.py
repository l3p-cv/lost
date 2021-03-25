__author__ = 'Jonas Jaeger'

from os.path import join
import os
from datetime import datetime
import json
import shutil
import zipfile
import lost
import fsspec
import numpy as np
import cv2

#import ptvsd


DATA_ROOT_PATH = ""
MEDIA_ROOT_PATH = DATA_ROOT_PATH + "media/"
MEDIA_UPLOAD_PATH = MEDIA_ROOT_PATH + "uploads/"
MEDIA_CHUNK_PATH = MEDIA_ROOT_PATH + ".chunks/"
# SCRIPT_ROOT_PATH = DATA_ROOT_PATH + "script/"
PIPE_ROOT_PATH = DATA_ROOT_PATH + "pipes/"
INSTANCE_ROOT_PATH = DATA_ROOT_PATH + "instance/"
DEBUG_ROOT_PATH = DATA_ROOT_PATH + "debug/"
SIA_HISTORY_PATH = DATA_ROOT_PATH + "sia_history/"
SIA_HISTORY_BACKUP_PATH = DATA_ROOT_PATH + "sia_history/backup/"
PIPE_LOG_PATH = DATA_ROOT_PATH + "logs/pipes/"
APP_LOG_PATH = DATA_ROOT_PATH + "logs/app/"
# MIA_CROP_PATH = DATA_ROOT_PATH + "mia_crops/"
JUPYTER_NOTEBOOK_OUTPUT_PATH = DATA_ROOT_PATH + "notebooks/jupyter_output.txt"
MY_DATA_PATH = "my_data/"

class FileMan(object):
    def __init__(self, lostconfig):
        self.lostconfig = lostconfig #type: lost.logic.config.LOSTConfig
        if len(lostconfig.fs_args) > 0:
            self.fs = fsspec.filesystem(lostconfig.fs_type, **lostconfig.fs_args)
        else:
            self.fs = fsspec.filesystem(lostconfig.fs_type)


    def load_img(self, path, color_type='color'):
        '''Load image from filesystem
        
        Args:
            path (str): Can be a relative path within the LOST filesystem or
                an absolute path for any other supported filesystem
            color_type (int): Color type of the image. Can be 'color' or 'gray'
        
        Returns:
            np.array: The loaded image
        '''
        if color_type == 'color':
            color = cv2.IMREAD_COLOR
        else:
            color = cv2.IMREAD_GRAYSCALE
        if not os.path.isabs(path):
            img_path = self.get_abs_path(path)
            with self.fs.open(img_path, 'rb') as f:
                arr = np.asarray((bytearray(f.read())), dtype=np.uint8)
                img = cv2.imdecode(arr, color)
            return img
        else:
            with fsspec.open(path) as f:
                arr = np.asarray((bytearray(f.read())), dtype=np.uint8)
                img = cv2.imdecode(arr, color)
            return img

    def get_version_log_path(self):
        return os.path.join(self.lostconfig.project_path, 'version-log.json')
            
    def get_pipe_log_path(self, pipe_id):
        base_path = os.path.join(self.lostconfig.project_path, PIPE_LOG_PATH)
        if not self.fs.exists(base_path):
            self.fs.mkdirs(base_path)
        return os.path.join(base_path, 'p-{}.log'.format(pipe_id))

    def get_app_log_path(self, log_file_name):
        base_path = os.path.join(self.lostconfig.project_path, APP_LOG_PATH)
        if not self.fs.exists(base_path):
            self.fs.mkdirs(base_path)
        return os.path.join(base_path, log_file_name)

    def get_rel_path(self, path):
        '''Get relativ path for current project

        Args:
            path (str): A absolute path

        Returns:
            str : Relative path
        '''
        if os.path.isabs(path):
            return self.make_path_relative(path)
        else:
            return path

    def get_abs_path(self, path):
        '''Get absolute path in current file system.

        Args:
            path (str): A relative path.

        Returns:
            str: Absolute path
        '''
        if not os.path.isabs(path):
            return os.path.join(self.lostconfig.project_path, path)
        else:
            return path

    def make_path_relative(self, in_path):
        '''Make a path relative to project root path.

        Args:
            in_path: Path to process.

        Returns:
            str: relative path.
        '''
        project_root = self.lostconfig.project_path
        if os.path.isabs(in_path):
            c_path = os.path.commonpath((in_path, project_root))
            out_path = in_path.replace(project_root, "")
            while out_path[0] == "/":
                out_path = out_path[1:]
            return out_path
        else:
            return in_path

    def rm_instance_path(self, pipe_element):
        i_path = self.get_instance_path(pipe_element)
        if self.fs.exists(i_path):
            #shutil.rmtree(i_path)
            self.fs.rm(i_path, recursive=True)

    def rm_pipe_context_path(self, pipe):
        p_path = self.get_pipe_context_path(pipe=pipe)
        if self.fs.exists(p_path):
            # shutil.rmtree(p_path)
            self.fs.rm(p_path, recursive=True)
    
    def rm_pipe_log_path(self, pipe):
        '''Remove log file for pipe
        
        Args:
            pipe (:class:`lost.db.model.Pipe`): The pipeline where
                the log file should be deleted for.'''
        path = self.get_pipe_log_path(pipe.idx)
        if self.fs.exists(path):
            os.remove(path)

    def get_instance_path(self, pipe_element):
        return self.create_instance_path(pipe_element)

    def get_pipe_context_path(self, pe=None, pipe=None):
        '''Get path to pipeline context

        Args:
            pe: PipelineElement
            pipe: Pipe
            lostconfig: LOSTConfig

        Returns:
            str: pipe context path
        '''
        if pe is not None:
            pipe_context = join(self.lostconfig.project_path, INSTANCE_ROOT_PATH,
                                'p-{}'.format(pe.pipe_id))
            if not self.fs.exists(pipe_context):
                self.fs.mkdirs(pipe_context)
            return pipe_context

        elif pipe is not None:
            pipe_context = join(self.lostconfig.project_path, INSTANCE_ROOT_PATH,
                                'p-{}'.format(pipe.idx))
            if not self.fs.exists(pipe_context):
                self.fs.mkdirs(pipe_context)
            return pipe_context
        else:
            raise Exception("No valid argument for pipe context path.")

    
    def get_jupyter_notebook_output_file(self):
        return join(self.lostconfig.project_path, JUPYTER_NOTEBOOK_OUTPUT_PATH)
        
    def create_instance_path(self, pipe_element):
        '''Create the instance path for a :class:`lost.db.models.PipeElement`

        Args:
            pipe_element (object): :class:`lost.db.models.PipeElement`

        Returns:
            str: The absolute instance path
        '''
        root_path = self.lostconfig.project_path
        i_path = join(root_path, INSTANCE_ROOT_PATH)
        if not self.fs.exists(i_path):
            self.fs.mkdirs(i_path)
        # task_path = join(i_path, str(pipe_element.task_id))
        # if not self.fs.exists(task_path):
        #     self.fs.mkdirs(task_path)
        pe_i_path = join(i_path, 'i-{}'.format(str(pipe_element.idx)))
        if not self.fs.exists(pe_i_path):
            self.fs.mkdirs(pe_i_path)
        return pe_i_path

    # def create_script_path(self, script_id):
    #     '''Create path where a script file will be stored.

    #         script_id: ID of the related :class:`lost.db.models.Script`

    #     Returns:
    #         The absolute path to the script folder.
    #     '''
    #     root_path = self.lostconfig.project_path
    #     script_dir = os.path.join(root_path,SCRIPT_ROOT_PATH)
    #     if not self.fs.exists(script_dir):
    #         self.fs.mkdirs(script_dir)
    #     script_i_dir = os.path.join(script_dir,str(script_id))
    #     if not self.fs.exists(script_i_dir):
    #         self.fs.mkdirs(script_i_dir)
    #     return script_i_dir

    @property
    def pipe_path(self):
        '''Get path to store pipeline directories.

        Returns:
            The absolute path to the pipeline folder.
        '''
        root_path = self.lostconfig.project_path
        pipe_path = os.path.join(root_path, PIPE_ROOT_PATH)
        return pipe_path

    def create_debug_path(self, pipe_element):
        root_path = self.lostconfig.project_path
        debug_path = join(root_path, DEBUG_ROOT_PATH)
        if not self.fs.exists(debug_path):
            self.fs.mkdirs(debug_path)
        task_path = join(debug_path, str(pipe_element.pipe_id))
        if not self.fs.exists(task_path):
            self.fs.mkdirs(task_path)
        pe_i_path = join(task_path, str(pipe_element.idx))
        if not self.fs.exists(pe_i_path):
            self.fs.mkdirs(pe_i_path)
        return pe_i_path

    def create_project_folders(self):
        '''Create folder structure for a project in lost webportal.

        Args:
            root: Root path of the project.
        '''
        root = self.lostconfig.project_path
        if not self.fs.exists(root):
            self.fs.mkdirs(root)
            print("\t Created: %s"%(root,))
        # if not self.fs.exists(join(root,SCRIPT_ROOT_PATH)):
        #     self.fs.mkdirs(join(root,SCRIPT_ROOT_PATH))
        #     print("\t Created: %s"%(join(root,SCRIPT_ROOT_PATH),))
        if not self.fs.exists(join(root,INSTANCE_ROOT_PATH)):
            self.fs.mkdirs(join(root,INSTANCE_ROOT_PATH))
            print("\t Created: %s"%(join(root,INSTANCE_ROOT_PATH),))
        if not self.fs.exists(join(root,MEDIA_ROOT_PATH)):
            self.fs.mkdirs(join(root,MEDIA_ROOT_PATH))
            print("\t Created: %s"%(join(root,MEDIA_ROOT_PATH),))
        if not self.fs.exists(join(root,DEBUG_ROOT_PATH)):
            self.fs.mkdirs(join(root,DEBUG_ROOT_PATH))
            print("\t Created: %s"%(join(root,DEBUG_ROOT_PATH),))
        if not self.fs.exists(join(root, MY_DATA_PATH)):
            self.fs.mkdirs(join(root, MY_DATA_PATH))
            print("\t Created: %s"%(join(root, MY_DATA_PATH),))

    @property
    def media_root_path(self):
        '''str: get absolute media root path
        '''
        return os.path.join(self.lostconfig.project_path, MEDIA_ROOT_PATH)
    
    @property
    def data_root_path(self):
        '''str: get absolute data root path
        '''
        return os.path.join(self.lostconfig.project_path, DATA_ROOT_PATH)

    @property
    def media_upload_path(self):
        '''str: get absolute media upload path
        '''
        return os.path.join(self.lostconfig.project_path, MEDIA_UPLOAD_PATH)
    
    @property
    def media_chunk_path(self):
        '''str: get absolute media chunk path
        '''
        return os.path.join(self.lostconfig.project_path, MEDIA_CHUNK_PATH)

    def get_media_rel_path_tree(self):
        '''get first sublevel of media directory
        Returns: 
            list: ['path/1', 'path/2']
        '''
        return path_to_dict(self.media_root_path)

    # def get_mia_crop_path(self, annotask_id):
    #     ''' get absolute path of mia_crop directory
    #     '''
    #     directory = os.path.join(self.lostconfig.project_path, MIA_CROP_PATH, str(annotask_id))
    #     if not self.fs.exists(directory):
    #         os.makedirs(directory)
    #     return directory

    # def rm_mia_crop_path(self, annotask_id):
    #     '''Remove all mia crops of an annotask

    #     Args:
    #         annotask_id: Id of annotask where the mia crops should be deleted for.
    #     '''
    #     mia_crop_path = self.get_mia_crop_path(annotask_id)
    #     if self.fs.exists(mia_crop_path):
    #         shutil.rmtree(mia_crop_path)

    # @property
    # def mia_crop_rel_path(self):
    #     ''' get relative path of mia_crop directory
    #     '''
    #     return MIA_CROP_PATH
    
    def get_sia_history_path(self, annotask):
        '''str: get absolute sia_history_path
        '''
        sia_hist_file = os.path.join(self.lostconfig.project_path, SIA_HISTORY_PATH, '{}_{}.json'.format(annotask.idx, annotask.name))
        if not self.fs.exists(os.path.split(sia_hist_file)[0]):
            os.makedirs(os.path.split(sia_hist_file)[0])
        return sia_hist_file

    def rm_sia_history_path(self, annotask):
        '''Remove sia_history file for annotask
        
        Args:
            annotask (:class:`lost.db.model.AnnoTask`): The annotask where
                the sia_history file should be deleted for.
        '''
        path = self.get_sia_history_path(annotask)
        backup_dir = os.path.join(self.lostconfig.project_path, SIA_HISTORY_BACKUP_PATH)
        if not self.fs.exists(backup_dir):
            os.makedirs(backup_dir)
        backup_path = os.path.join(self.lostconfig.project_path, SIA_HISTORY_BACKUP_PATH, '{}_{}_{}.json'.format(datetime.now(), annotask.idx, annotask.name))
        if self.fs.exists(path):
            os.rename(path, backup_path)

def unzipdir(src, dst):
    '''Unzip archive that contains a directory structure.

    Args:
        src: Path to zip file.
        dst: Path to store extracted directory.
    '''
    archive = zipfile.ZipFile(src)
    for file in archive.namelist():
        archive.extract(file, dst)

def zipdir(src, dst):
    '''Zip a directory

    Args:
        src: The directory to zip.
        dst: Path to store the created zip file.
    '''
    dst_path = os.path.abspath(dst)
    oldwd = os.getcwd()
    os.chdir(src)
    zipf = zipfile.ZipFile(dst_path, 'w', zipfile.ZIP_DEFLATED)
    for root, dirs, files in os.walk('.'):
        for f in files:
            zipf.write(os.path.join(root, f))
    zipf.close()
    os.chdir(oldwd)


def validate_action(db_man, path):
    ''' validates if move, edit or delete of a file or directory is allowed.
    '''
    for ds in db_man.get_all_datasources():
        if ds.raw_file_path in path:
            return False
    return True


def path_to_dict(path):
    if os.path.basename(path) == "":
        d = {'name': 'root'}
    else:
        d = {'name': os.path.basename(path)}
    if os.path.isdir(path):
        d['type'] = "directory"
        d['children'] = [path_to_dict(os.path.join(path,x)) for x in os.listdir(path)]
    else:
        d['type'] = "file"
    return d