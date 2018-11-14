__author__ = 'Jonas Jaeger'

from os.path import join
import os
import shutil
import zipfile
import lost
#import ptvsd


DATA_ROOT_PATH = "data/"
MEDIA_ROOT_PATH = DATA_ROOT_PATH + "media/"
IMAGESET_ROOT_PATH =  MEDIA_ROOT_PATH + "imageset/"
VIDEO_ROOT_PATH = MEDIA_ROOT_PATH + "video/"
MEDIA_UPLOAD_PATH = MEDIA_ROOT_PATH + "uploads/"
MEDIA_CHUNK_PATH = MEDIA_ROOT_PATH + ".chunks/"
# SCRIPT_ROOT_PATH = DATA_ROOT_PATH + "script/"
PIPE_ROOT_PATH = DATA_ROOT_PATH + "pipes/"
INSTANCE_ROOT_PATH = DATA_ROOT_PATH + "instance/"
DEBUG_ROOT_PATH = DATA_ROOT_PATH + "debug/"
SIA_HISTORY_PATH = DATA_ROOT_PATH + "sia_history/"
PIPE_LOG_PATH = DATA_ROOT_PATH + "logs/pipes/"
TWO_D_ANNO_PATH = MEDIA_ROOT_PATH + "two_d_annos/"
JUPYTER_NOTEBOOK_OUTPUT_PATH = DATA_ROOT_PATH + "notebooks/jupyter_output.txt"
APP_LOG_PATH = "logs/{}-lost.log"

class FileMan(object):
    def __init__(self, lostconfig):
        self.lostconfig = lostconfig #type: lost.logic.config.LOSTConfig
        self.app_log_path = os.path.join(self.lostconfig.project_path, APP_LOG_PATH.format(self.lostconfig.executor))
        
    def get_pipe_log_path(self, pipe_id):
        base_path = os.path.join(self.lostconfig.project_path, PIPE_LOG_PATH)
        if not os.path.exists(base_path):
            os.makedirs(base_path)
        return os.path.join(base_path, 'p-{}.log'.format(pipe_id))

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
        if os.path.exists(i_path):
            shutil.rmtree(i_path)

    def rm_pipe_context_path(self, pipe):
        p_path = self.get_pipe_context_path()
        if os.path.exists(p_path):
            shutil.rmtree(p_path)

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
            if not os.path.exists(pipe_context):
                os.mkdir(pipe_context)
            return pipe_context

        elif pipe is not None:
            pipe_context = join(self.lostconfig.project_path, INSTANCE_ROOT_PATH,
                                'p-{}'.format(pipe.idx))
            if not os.path.exists(pipe_context):
                os.mkdir(pipe_context)
            return pipe_context
        else:
            raise Exception("No valid argument for pipe context path.")

    def get_imageset_base(self):
        return join(self.lostconfig.project_path, IMAGESET_ROOT_PATH)
    
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
        if not os.path.exists(i_path):
            os.mkdir(i_path)
        # task_path = join(i_path, str(pipe_element.task_id))
        # if not os.path.exists(task_path):
        #     os.mkdir(task_path)
        pe_i_path = join(i_path, 'i-{}'.format(str(pipe_element.idx)))
        if not os.path.exists(pe_i_path):
            os.mkdir(pe_i_path)
        return pe_i_path

    # def create_script_path(self, script_id):
    #     '''Create path where a script file will be stored.

    #         script_id: ID of the related :class:`lost.db.models.Script`

    #     Returns:
    #         The absolute path to the script folder.
    #     '''
    #     root_path = self.lostconfig.project_path
    #     script_dir = os.path.join(root_path,SCRIPT_ROOT_PATH)
    #     if not os.path.exists(script_dir):
    #         os.mkdir(script_dir)
    #     script_i_dir = os.path.join(script_dir,str(script_id))
    #     if not os.path.exists(script_i_dir):
    #         os.mkdir(script_i_dir)
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
        if not os.path.exists(debug_path):
            os.mkdir(debug_path)
        task_path = join(debug_path, str(pipe_element.pipe_id))
        if not os.path.exists(task_path):
            os.mkdir(task_path)
        pe_i_path = join(task_path, str(pipe_element.idx))
        if not os.path.exists(pe_i_path):
            os.mkdir(pe_i_path)
        return pe_i_path

    def is_valid_imageset_path(self, imgset_path):
        return IMAGESET_ROOT_PATH in imgset_path

    def is_valid_video_path(self, video_path):
        return VIDEO_ROOT_PATH in video_path

    def create_project_folders(self):
        '''Create folder structure for a project in lost webportal.

        Args:
            root: Root path of the project.
        '''
        root = self.lostconfig.project_path
        if not os.path.exists(root):
            os.mkdir(root)
            print("\t Created: %s"%(root,))
        # if not os.path.exists(join(root,SCRIPT_ROOT_PATH)):
        #     os.mkdir(join(root,SCRIPT_ROOT_PATH))
        #     print("\t Created: %s"%(join(root,SCRIPT_ROOT_PATH),))
        if not os.path.exists(join(root,INSTANCE_ROOT_PATH)):
            os.mkdir(join(root,INSTANCE_ROOT_PATH))
            print("\t Created: %s"%(join(root,INSTANCE_ROOT_PATH),))
        if not os.path.exists(join(root,MEDIA_ROOT_PATH)):
            os.mkdir(join(root,MEDIA_ROOT_PATH))
            print("\t Created: %s"%(join(root,MEDIA_ROOT_PATH),))
        if not os.path.exists(join(root,IMAGESET_ROOT_PATH)):
            os.mkdir(join(root,IMAGESET_ROOT_PATH))
            print("\t Created: %s"%(join(root,IMAGESET_ROOT_PATH),))
        if not os.path.exists(join(root,VIDEO_ROOT_PATH)):
            os.mkdir(join(root,VIDEO_ROOT_PATH))
            print("\t Created: %s"%(join(root,VIDEO_ROOT_PATH),))
        if not os.path.exists(join(root,DEBUG_ROOT_PATH)):
            os.mkdir(join(root,DEBUG_ROOT_PATH))
            print("\t Created: %s"%(join(root,DEBUG_ROOT_PATH),))

    # def rm_script_folder(self, script):
    #     '''Remove folder for a specific script.
    #     '''
    #     s_path = join(self.lostconfig.project_path, SCRIPT_ROOT_PATH, str(script.idx))
    #     shutil.rmtree(s_path)

    @property
    def media_root_path(self):
        # try:
        #     ptvsd.enable_attach(secret='my_secret',address = ('0.0.0.0', 3500))
        #     print("Started Debug Server")
        # except Exception:
        #     print("Port Already in Use")
        # ptvsd.wait_for_attach()
        # ptvsd.break_into_debugger()
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
        path_json = list()
        for file in os.listdir(self.media_root_path):
            if not file.startswith('.'):
               path_json.append(file)
        return path_json

    @property
    def two_d_path(self):
        ''' get absolute path of two_d_anno directory
        '''
        return os.path.join(self.lostconfig.project_path, TWO_D_ANNO_PATH)

    @property
    def two_d_rel_path(self):
        ''' get relative path of two_d_anno directory
        '''
        return TWO_D_ANNO_PATH
    
    @property
    def sia_history_path(self):
        '''str: get absolute sia_history_path
        '''
        return os.path.join(self.lostconfig.project_path, SIA_HISTORY_PATH)



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
