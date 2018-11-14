'''
A modul for basic interaction of custom scripts with the portal.
'''
__author__ = 'Jonas Jäger'

from lost.db import access
from lost.db import model
from lost.db import dtype, state
from lost.logic.pipeline import pipe_model
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
from lost.pyapi import pipe_element
from lost.pyapi import annos

def report_script_err(pipe_element, task, dbm, msg):
    '''Report an error for a script to portal

    Args:
        msg (str): The error message that should be reported.

    Note:
        You can call this method multiple times if you like. All messages
        will be concatenated an sent to the portal.
    '''
    if pipe_element.error_msg is None:
        pipe_element.error_msg = str(msg)
    else:
        pipe_element.error_msg += str(msg)
    debug_info = "PipeElementID {}".format(pipe_element.idx)
    pipe_element.error_msg += debug_info
    pipe_element.state = state.PipeElement.SCRIPT_ERROR
    task.state = state.Pipe.ERROR
    dbm.add(task)
    dbm.add(pipe_element)
    dbm.commit()

class Script(pipe_element.Element):
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
        self._outp = Output(self)
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
        return self._inp

    @property
    def outp(self):
        ''':class:`Output`
        '''
        return self._outp


    def break_loop(self):
        '''Break next loop in pipeline.
        '''
        loop_e = self._pipe_man.get_next_loop(self._pipe_element)
        if loop_e is not None:
            loop_e.loop.break_loop = True
        self._dbm.add(loop_e)

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

    def write(self, obj, file_name, f_type='ocv_img', context='instance'):
        '''Write a file in specific format to a given context in file_sytem.

        Args:
            obj (object): The object to store.
            file_name (str): Name of the file that should be written to file_system.
                Can also be a relative path.
            f_type (str): Options: *ocv_img*, *sk_img*, *json*, *pickle*
            context (str): Options: *instance*, *pipe*, *static*
        Returns:
            str: Absolute path where file was stored.
        '''
        if context == 'instance':
            context_path = self.instance_context
        elif context == 'pipe':
            context_path = self.pipe_context
        elif context == 'static':
            context_path = self.static_context
        else:
            raise Exception('Unknown context: {}'.format(context))
        store_path = os.path.join(context_path, file_name)
        if not os.path.exists(store_path):
            store_dirs = os.path.split(store_path)[0]
            os.makedirs(store_dirs, exist_ok=True)
        if f_type == 'ocv_img':
            import cv2
            cv2.imwrite(store_path, obj)
        elif f_type =='sk_img':
            import skimage.io
            skimage.io.imsave(store_path, obj)
        elif f_type == 'json':
            with open(store_path, 'w') as the_file:
                json.dump(obj, the_file, indent=4)
        elif f_type == 'pickle':
            with open(store_path, 'wb') as the_file:
                pickle.dump(obj, the_file)
        else:
            raise Exception('Unknown f_type: {}'.format(f_type))
        return store_path

    def read(self, file_name, f_type='ocv_img', context='instance'):
        '''Read file in specific format from specified context in file_sytem.

        Args:
            file_name (str): Name of the file that should be written to file_system.
                Can also be a relative path.
            f_type (str): Options: *ocv_img*, *json*, *pickle*
            context (str): Options: *instance*, *pipe*, *static*

        Returns:
            object: The loaded object.
        '''
        if context == 'instance':
            context_path = self.instance_context
        elif context == 'pipe':
            context_path = self.pipe_context
        elif context == 'static':
            context_path = self.static_context
        else:
            raise Exception('Unknown context: {}'.format(context))
        load_path = os.path.join(context_path, file_name)
        if f_type == 'ocv_img':
            #obj = cv2.imread(load_path)
            raise NotImplementedError('Hi future JJ:-) Use sk-image instead of opencv')
        elif f_type == 'json':
            with open(load_path) as the_file:
                obj = json.load(the_file)
        elif f_type == 'pickle':
            with open(load_path, 'rb') as the_file:
                obj = pickle.load(the_file)
        else:
            raise Exception('Unknown f_type: {}'.format(f_type))
        return obj



    def i_am_done(self):
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


class Output(inout.Output):
    def __init__(self, script):
        super().__init__(script)
        self._script = self._element

    def add_img_anno(self, anno):
        '''Add an ImageAnnotation to output.

        Args:
            anno (ImageAnnotation): An image annotation object.
        '''
        for pe in self._connected_pes:
            anno.img_path = self._script.file_man.make_path_relative(anno.img_path)
            anno.result_id = self._result_map[pe.idx]
            anno.iteration = self._script._pipe_element.iteration
            self._script._dbm.add(anno)

    def add_visual_output(self, img_path=None, html=None):
        if img_path is None and html is None:
            raise Exception('One of the arguments need to be not None!')
        for pe in self._connected_pes:
            if pe.dtype == dtype.PipeElement.VISUALIZATION:
                if img_path is not None:
                    rel_path = self._script.file_man.make_path_relative(img_path)
                    vo_type = dtype.VisualOutput.IMAGE
                else:
                    rel_path = None
                    vo_type = dtype.VisualOutput.HTML
                vis_out = model.VisualOutput(dtype=vo_type,
                                          img_path=rel_path,
                                          html_string=html,
                                          result_id=self._result_map[pe.idx],
                                          iteration=self._script._pipe_element.iteration)
                self._script._dbm.add(vis_out)

    def add_data_export(self, file_path):
        for pe in self._connected_pes:
            if pe.dtype == dtype.PipeElement.DATA_EXPORT:
                rel_path = self._script.file_man.make_path_relative(file_path)
                export = model.DataExport(file_path=rel_path,
                                       result_id=self._result_map[pe.idx],
                                       iteration=self._script._pipe_element.iteration)
                self._script._dbm.add(export)

    def __check_for_video(self, frame_n, video_path):
        if frame_n is None and video_path is not None:
            raise Exception('If frame_n is provided a video_path is also required!')
        if video_path is None and frame_n is not None:
            raise Exception('If video_path is provided a frame_n is also required!')

    # def request_anno_again(self, anno_obj):
    #     '''Request an annotation that is already present in db again
        
    #     Args:
    #         anno_obj (annos.Annotation): The annotation that should be
    #             requested for an annotation task again.
    #     '''
    #     anno_obj._unlock()
    #     #anno_obj.add_to_context(self._script._dbm)

    def request_bba(self, img_path, boxes = [], label_list = [],
                    frame_n=None, video_path=None, sim_classes=[]):
        '''Request BBoxAnnotations for an image.

        Args:
            img_path (str): Path of the image.
            boxes (list) : A list of boxes [[x,y,w,h],..].
            label_list (list) : A list of labels for each box. A box can
                contain multiple lables.
                [[b0_lbl0, b0_lbl1, ...], ... , [bn_lbl0]]
            frame_n (int): If *img_path* belongs to a video *frame_n* indicates
                the framenumber.
            video_path (str): If *img_path* belongs to a video this is the path to
                this video.
            sim_classes (list): [sim_class1, sim_class2,...] 
                A list of similarity classes that is used to 
                cluster BBoxes when using MIA for annotation.

        Note:
            There are three cases when you request a bbox annotation.

            Case1: Annotate empty image
                You just want to get bounding boxes drawn by a human annotator
                for an image.
                -> Only set the img_path argument.
            Case2: Annotate image with a preset of boxes
                You want to get verified predicted bounding boxes by a human
                annotator and you have not predicted a label for the boxes.
                -> Set the img_path argument and boxes.
            Case3: Annotate image with a preset of boxes and labels
                You want to get predicted bounding boxes and the related predicted
                labels to be verified by a human annotator.
                -> Set the img_path and the bb_dict argument. For boxes you
                need to assign a list of box and a list of label_ids for label_list.
                E.g. boxes =[[0.1,0.1,0.2,0.3],...], label_list =[[1,5],...]
        
        Example:
            How to use this method in a Script::

                self.request_bba('path/to/img.png', 
                    boxes=[[0.1,0.1,0.2,0.3],[0.2,0.2,0.4,0.4]], 
                    label_list=[[0],[1]]
                )
        '''
        self.__check_for_video(frame_n, video_path)
        if video_path is not None:
            video_path = self._script.get_rel_path(video_path)
        for pe in self._connected_pes:
            if pe.dtype == dtype.PipeElement.ANNO_TASK:
                rel_img_path = self._script.file_man.make_path_relative(img_path)
                img_anno = annos.Image(anno_task_id=pe.anno_task.idx,
                                        img_path=rel_img_path,
                                        state=state.Anno.UNLOCKED,
                                        result_id=self._result_map[pe.idx],
                                        iteration=self._script._pipe_element.iteration,
                                        frame_n=frame_n,
                                        video_path=video_path)
                img_anno.add_to_context(self._script._dbm)
                for i, bb in enumerate(boxes):
                    bbox = annos.BBox(bb, pe.anno_task.idx, 
                                        self._script._pipe_element.iteration)
                    if label_list:
                        if len(label_list) != len(boxes):
                            raise ValueError('*label_list* and *boxes* need to be of same size!')
                        labels = label_list[i]
                        for label_leaf_id in labels:
                            if label_leaf_id is not None:
                                bbox.add_label(label_leaf_id)
                    if sim_classes:
                        if len(sim_classes) != len(boxes):
                            raise ValueError('*sim_classes* and *boxes* need to have same size!')
                        bbox.sim_class = sim_classes[i]
                    img_anno.add_bbox(bbox)

    def add_bba(self, img_path, boxes = [], label_list = [],
                    frame_n=None, video_path=None, sim_classes=[]):
        '''Add BBoxAnnotations to the output of this Script.

        Args:
            img_path (str): Path of the image.
            boxes (list) : A list of boxes [[x,y,w,h],..].
            label_list (list) : A list of labels for each box. A box can
                contain multiple lables.
                [[b0_lbl0, b0_lbl1, ...], ... , [bn_lbl0]]
            frame_n (int): If *img_path* belongs to a video *frame_n* indicates
                the framenumber.
            video_path (str): If *img_path* belongs to a video this is the path to
                this video.
            sim_classes (list): [sim_class1, sim_class2,...] 
                A list of similarity classes that is used to 
                cluster BBoxes when using MIA for annotation.

        Note:
            There are three cases when you request a bbox annotation.

            Case1: Annotate empty image
                You just want to get bounding boxes drawn by a human annotator
                for an image.
                -> Only set the img_path argument.
            Case2: Annotate image with a preset of boxes
                You want to get verified predicted bounding boxes by a human
                annotator and you have not predicted a label for the boxes.
                -> Set the img_path argument and boxes.
            Case3: Annotate image with a preset of boxes and labels
                You want to get predicted bounding boxes and the related predicted
                labels to be verified by a human annotator.
                -> Set the img_path and the bb_dict argument. For boxes you
                need to assign a list of box and a list of label_ids for label_list.
                E.g. boxes =[[0.1,0.1,0.2,0.3],...], label_list =[[1,5],...]
        '''
        self.__check_for_video(frame_n, video_path)
        if video_path is not None:
            video_path = self._script.get_rel_path(video_path)
        for pe in self._connected_pes:
            rel_img_path = self._script.file_man.make_path_relative(img_path)
            img_anno = annos.Image(anno_task_id=None,
                                    img_path=rel_img_path,
                                    state=state.Anno.UNLOCKED,
                                    result_id=self._result_map[pe.idx],
                                    iteration=self._script._pipe_element.iteration,
                                    frame_n=frame_n,
                                    video_path=video_path)
            img_anno.add_to_context(self._script._dbm)
            for i, bb in enumerate(boxes):
                bbox = annos.BBox(bb, None, 
                                    self._script._pipe_element.iteration)
                if label_list:
                    if len(label_list) != len(boxes):
                        raise ValueError('*label_list* and *boxes* need to be of same size!')
                    labels = label_list[i]
                    for label_leaf_id in labels:
                        if label_leaf_id is not None:
                            bbox.add_label(label_leaf_id)
                if sim_classes:
                    if len(sim_classes) != len(boxes):
                        raise ValueError('*sim_classes* and *boxes* need to have same size!')
                    bbox.sim_class = sim_classes[i]
                img_anno.add_bbox(bbox)

    def request_mia(self, img_path, sim_class=None, frame_n=None, video_path=None):
        '''Request a class label annotation for an image for MIA (MultiImageAnnotation).

        Args:
            img_path (str): Path to the image that should be annotated.
            sim_class (int): A similarity class for this image. This similarity measure
                will be used to cluster images for MultiObjectAnnoation ->
                Images with the same sim_class will be presented to the
                annotator in one step.
            frame_n (int): If *img_path* belongs to a video *frame_n* indicates
                the framenumber.
            video_path (str): If *img_path* belongs to a video this is the path to
                this video. 
        '''
        self.__check_for_video(frame_n, video_path)
        if video_path is not None:
            video_path = self._script.get_rel_path(video_path)
        if sim_class is None:
            sim_class = 1

        for pe in self._connected_pes:
            if pe.dtype == dtype.PipeElement.ANNO_TASK:
                if pe.anno_task.dtype == dtype.AnnoTask.MIA:
                    rel_img_path = self._script.file_man.make_path_relative(img_path)
                    img_anno = annos.Image(anno_task_id=pe.anno_task.idx,
                                          img_path=rel_img_path,
                                          sim_class=sim_class,
                                          state=state.Anno.UNLOCKED,
                                          result_id=self._result_map[pe.idx],
                                          iteration=self._script._pipe_element.iteration,
                                          frame_n=frame_n,
                                          video_path=video_path)
                    img_anno.add_to_context(self._script._dbm)