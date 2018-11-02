import json
from lost.db import model, state, dtype
from datetime import datetime

def update_anno_task(data_man, anno_task_id):
    remaining = None
    available = None
    response = dict()
    anno_task = data_man.get_anno_task(anno_task_id=anno_task_id)
    if anno_task.dtype == dtype.AnnoTask.SIA or anno_task.dtype == dtype.AnnoTask.MIA :
        pipe_element=data_man.get_pipe_element(pipe_e_id=anno_task.pipe_element_id)
        #TODO: count only from current iteration remaining annos
        remaining = None
        available = None

        # if MIA: check type (annoBased or imageBased) and decide which annos to count
        if anno_task.dtype == dtype.AnnoTask.MIA:
            config = json.loads(anno_task.configuration)
            if config['type'] == 'annoBased':
                remaining, available = __get_two_d_anno_counts(data_man, anno_task_id, pipe_element.iteration)
            elif config['type'] == 'imageBased':
                remaining, available = __get_image_anno_counts(data_man, anno_task_id, pipe_element.iteration)

        # in case of SIA always count imageBased
        else:
            remaining, available = __get_image_anno_counts(data_man, anno_task_id, pipe_element.iteration)

        if available:
            try:
                progress = 100* float(available-remaining)/available
            except Exception:
                print("ZeroDivisionError: AnnoTask Progress couldn`t be calculated. No annotations foound.")
        else:
            progress = float(100)
        response['progress'] = int(progress)
        response['remainingAnnos'] = remaining
        annotask = data_man.get_anno_task(anno_task_id)
        annotask.progress = progress
        data_man.save_obj(annotask)
        return response

def __get_image_anno_counts(data_man, anno_task_id, iteration):
    remaining = data_man.count_image_remaining_annos(anno_task_id=anno_task_id).r
    available = None
    for r in data_man.count_all_image_annos(anno_task_id=anno_task_id, iteration=iteration)[0]:
            available = r
    return remaining, available

def __get_two_d_anno_counts(data_man, anno_task_id, iteration):
    remaining = data_man.count_two_d_remaining_annos(anno_task_id=anno_task_id).r
    available = None
    for r in data_man.count_all_two_d_annos(anno_task_id=anno_task_id, iteration=iteration)[0]:
            available = r
    return remaining, available


def set_finished(data_man, anno_task_id):
    anno_task = data_man.get_anno_task(anno_task_id=anno_task_id)
    pipe_e = data_man.get_pipe_element(pipe_e_id=anno_task.pipe_element_id)
    if anno_task.state == state.AnnoTask.FINISHED:
        return "already finished"
    if anno_task.state == state.AnnoTask.IN_PROGRESS or \
    anno_task.state == state.AnnoTask.PAUSED:
        
        progress = update_anno_task(data_man, anno_task_id)
        if progress['remainingAnnos'] is None:
            return "error: annotations not found"
        if int(progress['remainingAnnos']) == 0:
            anno_task.progress = progress['progress']
            anno_task.state = state.AnnoTask.FINISHED
            data_man.add(anno_task)
            pipe_e.state = state.PipeElement.FINISHED
            data_man.add(pipe_e)
            data_man.commit()
            return "succeeded"
        else:
            return "not finished, remaining: " + str(progress['remainingAnnos'])

def get_current_annotask(db_man, anno_type, user_id):
        current_task = dict()
        current_task['name'] = "nothing_available"
        for chat in db_man.get_choosen_annotask(user_id):
            if chat.anno_task.dtype == anno_type:
                if chat.anno_task.state != state.AnnoTask.IN_PROGRESS:
                    db_man.delete(chat)
                    db_man.commit()
                    return current_task
                
                # check if respective pipeline is not in progress           
                pipe_element = db_man.get_pipe_element(pipe_e_id=chat.anno_task.pipe_element_id) 
                pipe = db_man.get_pipe(pipe_id=pipe_element.pipe_id)
                if pipe.state != state.Pipe.IN_PROGRESS:
                    return current_task

                current_task['id'] = chat.anno_task.idx
                current_task['name'] = chat.anno_task.name
                current_task['instructions'] = chat.anno_task.instructions
                current_task['remainingAnnos'] = None
                if chat.anno_task.dtype == dtype.AnnoTask.MIA:
                    config = json.loads(chat.anno_task.configuration)
                    if config['type'] == 'imageBased':
                        current_task['remainingAnnos'] = db_man.count_image_remaining_annos(anno_task_id=chat.anno_task_id).r
                    elif config['type'] == 'annoBased':
                        current_task['remainingAnnos'] = db_man.count_two_d_remaining_annos(anno_task_id=chat.anno_task_id).r
                else:
                    current_task['remainingAnnos'] = db_man.count_image_remaining_annos(anno_task_id=chat.anno_task_id).r
                if chat.anno_task.progress == None:
                    current_task['progress'] = 0
                else:
                    current_task['progress'] = int(chat.anno_task.progress)

        return current_task

def get_available_annotasks(db_man, anno_type, user_id):
    ''' get all available  annotation task for user

    Args:
        data_man: Project Manager
        user_id(int): user id
        anno_type(int): type of annotation task

    Returns:
        json with all data of the available tasks
    '''
    available_tasks = dict()
    available_tasks['annotask_available'] = list()
    for annotask in db_man.get_available_annotask(user_id, anno_type):
        if annotask.pipe_element_id is None:
            raise Exception("No PipeElement for AnnoTask")
        pipeelement = db_man.get_pipe_element(pipe_e_id=annotask.pipe_element_id)
        task = db_man.get_pipe(pipe_id=pipeelement.pipe_id)
        at = dict()
        at['DT_RowId'] = annotask.idx
        at['name'] = annotask.name
        at['task_name'] = task.name
        at['assigned_to'] = "All Users"
        if annotask.annotater_id and annotask.annotater_id != -1:
            user = db_man.get_user_meta(annotask.annotater_id)
            at['assigned_to'] = user.first_name +" "+ user.last_name
        at['progress'] = "0 %"
        if annotask.progress:
            at['progress'] = str(int(annotask.progress)) + " %"
        at['date'] = annotask.timestamp
        if annotask.manager_id:
            user = db_man.get_user_meta(annotask.manager_id)
            at['author'] = user.first_name +" "+ user.last_name
        else:
            at['author'] = "Unknown"
        if annotask.dtype == dtype.AnnoTask.MIA:
            config = json.loads(annotask.configuration)
            if config['type'] == 'imageBased':
                at['size'] = db_man.count_image_remaining_annos(anno_task_id=annotask.idx).r
            elif config['type'] == 'annoBased':
                at['size'] = db_man.count_two_d_remaining_annos(anno_task_id=annotask.idx).r
        else:
            at['size'] = db_man.count_image_remaining_annos(anno_task_id=annotask.idx).r

        # for r in db_man.count_all_image_annos(anno_task_id=annotask.idx, iteration=pipeelement.iteration)[0]:
        #     at['size'] = r
        available_tasks['annotask_available'].append(at)
    return available_tasks

def choose_annotask(db_man, anno_type, anno_task_id, user_id):
    # first delete all previous choosen bba_annotasks
        for chat in db_man.get_choosen_annotask(user_id):
            if chat.anno_task.dtype == anno_type:
                db_man.delete(chat)
                db_man.commit()
        # choose new one
        newcat = model.ChoosenAnnoTask(user_id=user_id, anno_task_id=anno_task_id)
        db_man.save_obj(newcat)

def has_annotation(db_man, anno_task_id):
    if db_man.count_annos(anno_task_id) > 0:
        return True
    else: return False