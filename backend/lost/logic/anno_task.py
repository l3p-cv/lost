import json
from lost.db import model, state, dtype
from datetime import datetime
from lost.pyapi import pipe_elements
import pandas as pd
from lost.logic import email
from lost import settings

def update_anno_task(dbm, anno_task_id, user_id=None):
    remaining = None
    available = None
    response = dict()
    anno_task = dbm.get_anno_task(anno_task_id=anno_task_id)
    if anno_task.dtype == dtype.AnnoTask.SIA or anno_task.dtype == dtype.AnnoTask.MIA :
        pipe_element=dbm.get_pipe_element(pipe_e_id=anno_task.pipe_element_id)
        #TODO: count only from current iteration remaining annos
        remaining = None
        available = None

        # if MIA: check type (annoBased or imageBased) and decide which annos to count
        if anno_task.dtype == dtype.AnnoTask.MIA:
            config = json.loads(anno_task.configuration)
            if config['type'] == 'annoBased':
                remaining, available = __get_two_d_anno_counts(dbm, anno_task_id, pipe_element.iteration)
            elif config['type'] == 'imageBased':
                remaining, available = __get_image_anno_counts(dbm, anno_task_id, pipe_element.iteration)

        # in case of SIA always count imageBased
        else:
            remaining, available = __get_image_anno_counts(dbm, anno_task_id, pipe_element.iteration)

        if available:
            try:
                progress = 100* float(available-remaining)/available
            except Exception:
                print("ZeroDivisionError: AnnoTask Progress couldn`t be calculated. No annotations foound.")
        else:
            progress = float(100)
        response['progress'] = int(progress)
        response['remainingAnnos'] = remaining
        annotask = dbm.get_anno_task(anno_task_id)
        annotask.progress = progress
        if user_id:
            annotask.last_activity = datetime.now()
            annotask.last_annotator_id = user_id
        dbm.save_obj(annotask)
        return response

def __get_image_anno_counts(dbm, anno_task_id, iteration):
    remaining = dbm.count_image_remaining_annos(anno_task_id=anno_task_id).r
    available = None
    for r in dbm.count_all_image_annos(anno_task_id=anno_task_id, iteration=iteration)[0]:
        available = r
    return remaining, available

def __get_two_d_anno_counts(dbm, anno_task_id, iteration):
    remaining = dbm.count_two_d_remaining_annos(anno_task_id=anno_task_id).r
    available = None
    for r in dbm.count_all_two_d_annos(anno_task_id=anno_task_id, iteration=iteration)[0]:
        available = r
    return remaining, available


def set_finished(dbm, anno_task_id):
    anno_task = dbm.get_anno_task(anno_task_id=anno_task_id)
    pipe_e = dbm.get_pipe_element(pipe_e_id=anno_task.pipe_element_id)

    if anno_task.state == state.AnnoTask.FINISHED:
        return "already finished"
    if anno_task.state == state.AnnoTask.IN_PROGRESS or \
    anno_task.state == state.AnnoTask.PAUSED:
        
        progress = update_anno_task(dbm, anno_task_id)
        if progress['remainingAnnos'] is None:
            return "error: annotations not found"
        if int(progress['remainingAnnos']) == 0:
            anno_task.progress = progress['progress']
            anno_task.state = state.AnnoTask.FINISHED
            dbm.add(anno_task)
            pipe_e.state = state.PipeElement.FINISHED
            dbm.add(pipe_e)
            dbm.commit()
            try: 
                email.send_annotask_finished(dbm, anno_task)
            except:
                pass
                #msg = "Could not send Email. \n"
                #msg += traceback.format_exc()
                #self.logger.error(msg)
            for chat in dbm.get_choosen_annotask(anno_task_id=anno_task_id):
                dbm.delete(chat)
                dbm.commit()
            return "success"
        else:
            return "not finished, remaining: " + str(progress['remainingAnnos'])

def get_current_annotask(dbm, user):
        if len(user.choosen_anno_tasks) > 0:
            anno_task = user.choosen_anno_tasks[0].anno_task
            return __get_at_info(dbm, anno_task, user.idx, True)
        return None

def get_available_annotasks(dbm, group_ids, user_id):
    ''' get all available  annotation task for user

    Args:
        dbm: Project Manager
        user_id(int): user id
        anno_type(int): type of annotation task

    Returns:
        json with all data of the available tasks
    '''
    available_annotasks = list()
    for annotask in dbm.get_available_annotask(group_ids):
        if annotask.pipe_element.pipe.state == state.Pipe.PAUSED:
            pass
        else:
            available_annotasks.append(__get_at_info(dbm, annotask, user_id))
    return available_annotasks

def __get_at_info(dbm, annotask, user_id, amount_per_label=False):
    if annotask.pipe_element_id is None:
        raise Exception("No PipeElement for AnnoTask")
    pipeelement = dbm.get_pipe_element(pipe_e_id=annotask.pipe_element_id)
    pipeline = dbm.get_pipe(pipe_id=pipeelement.pipe_id)
    at = dict()
    at['name'] = annotask.name
    at['id'] = annotask.idx
    at['pipelineName'] = pipeline.name
    at['pipelineCreator'] = pipeline.manager.user_name
    at['group'] = annotask.group.name
    at['instructions'] = annotask.instructions
    at['createdAt'] = None
    if annotask.timestamp:
        at['createdAt'] = annotask.timestamp.strftime(settings.STRF_TIME)
    at['lastActivity'] = None
    if annotask.last_activity:
        at['lastActivity'] = annotask.last_activity.strftime(settings.STRF_TIME)
    at['lastAnnotator'] = "N/A"
    if annotask.last_annotator:
        at['lastAnnotator'] = annotask.last_annotator.user_name
    at['type'] = None
    at['finished'] = None
    at['size'] = None
    at['status'] = None
    if annotask.state == state.AnnoTask.PENDING:
        at['status'] = 'pending'
    elif annotask.state == state.AnnoTask.IN_PROGRESS:
        at['status'] = 'inProgress'
    elif annotask.state == state.AnnoTask.FINISHED:
        at['status'] = 'finished'
    elif annotask.state == state.AnnoTask.PAUSED:
        at['status'] = 'paused'
    at['statistic'] = dict()
    at['statistic']['amountPerLabel'] = []
    at['statistic']['secondsPerAnno'] = None
    if annotask.dtype == dtype.AnnoTask.MIA:
        at['type'] = 'MIA'
        config = json.loads(annotask.configuration)
        if config['type'] == 'imageBased':
            remaining, available = __get_image_anno_counts(dbm, annotask.idx, pipeelement.iteration)
            finished = available-remaining
            at['finished'] = finished
            at['size'] = available
            if amount_per_label:
                at['statistic']['amountPerLabel'] = __get_amount_per_label(dbm, pipeelement, finished, 'imageBased')
                at['statistic']['secondsPerAnno'] = __get_seconds_per_anno(dbm, pipeelement, user_id, 'imageBased')
        elif config['type'] == 'annoBased':
            remaining, available = __get_two_d_anno_counts(dbm, annotask.idx, pipeelement.iteration)
            finished = available-remaining
            at['finished'] = finished
            at['size'] = available
            if amount_per_label:
                at['statistic']['amountPerLabel'] = __get_amount_per_label(dbm, pipeelement, finished, 'annoBased')
                at['statistic']['secondsPerAnno'] = __get_seconds_per_anno(dbm, pipeelement, user_id, 'annoBased')
    else:
        at['type'] = 'SIA'
        remaining, available = __get_image_anno_counts(dbm, annotask.idx, pipeelement.iteration)
        finished = available-remaining
        at['finished'] = finished
        at['size'] = available
        if amount_per_label:
            at['statistic']['amountPerLabel'] =  __get_amount_per_label(dbm, pipeelement, finished, 'annoBased')
            at['statistic']['secondsPerAnno'] = __get_seconds_per_anno(dbm, pipeelement, user_id, 'annoBased')
    
    return at

def choose_annotask(dbm, anno_task_id, user_id):
    # first delete all previous choosen annotasks
    anno_task = dbm.get_anno_task(anno_task_id=anno_task_id)
    for chat in dbm.get_choosen_annotask(user_id):
        if not chat.anno_task_id == anno_task.idx:
            dbm.delete(chat)
            dbm.commit()
    # choose new one
    if anno_task.state == state.AnnoTask.IN_PROGRESS or \
    anno_task.state == state.AnnoTask.PAUSED:
        if not anno_task.timestamp:
            anno_task.timestamp = datetime.now()
            dbm.save_obj(anno_task)
        try:
            newcat = model.ChoosenAnnoTask(user_id=user_id, anno_task_id=anno_task_id)
            dbm.save_obj(newcat)
        except:
            pass

def has_annotation(dbm, anno_task_id):
    if dbm.count_annos(anno_task_id) > 0:
        return True
    else: return False

def has_annotation_in_iteration(dbm, anno_task_id, iteration):
    if dbm.count_annos(anno_task_id, iteration) > 0:
        return True
    else: return False
        
def __get_seconds_per_anno(dbm, pipeelement, anno_type, user_id=None):
    mean_time = dbm.mean_anno_time(pipeelement.anno_task.idx, user_id, anno_type)[0]
    if mean_time is not None:
        return '{:.2f}'.format(mean_time)
    return None

def __get_amount_per_label(dbm, pipeelement, finished, anno_type):
    dist = list()
    annotask = pipe_elements.AnnoTask(pipeelement, dbm)
    for index, row in annotask.possible_label_df.iterrows():
        row['idx']
        result = dbm.get_amount_per_label(annotask.idx,row['idx'],anno_type)[0]
        if result > 0: 
            dist.append({
                'label': row['name'],
                'amount': result,
                'color': row['color']
            })
    return dist 

def get_annotask_statistics(dbm, annotask_id):
    anno_task = dbm.get_anno_task(anno_task_id=annotask_id)
    return __get_at_info(dbm, anno_task, None, True)
