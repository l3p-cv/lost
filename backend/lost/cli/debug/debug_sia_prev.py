
from enum import auto
import lost
import json
import os
import flask
from lost.db import dtype, state, model, access
from lost.db.access import DBMan
from lost.logic.anno_task import set_finished, update_anno_task
from datetime import datetime
from lost.logic.file_man import FileMan
from lost.settings import LOST_CONFIG, DATA_URL

USER_ID=7

def get_sia_anno_task(db_man, user_id): 
    for cat in db_man.get_choosen_annotask(user_id):
        if cat.anno_task.dtype == dtype.AnnoTask.SIA:
            return cat.anno_task
    return None

user_id = USER_ID
img_id = 171221
db_man = access.DBMan(LOST_CONFIG)
at = get_sia_anno_task(db_man, user_id)
iteration = db_man.get_pipe_element(pipe_e_id=at.pipe_element_id).iteration
image_anno = db_man.get_previous_sia_anno(at.idx, user_id, img_id, iteration)
is_last_image = False
is_first_image = False
first_anno = db_man.get_first_sia_anno(at.idx, iteration, user_id)
if image_anno is None:
    if first_anno:
        image_anno = db_man.get_image_anno(img_anno_id=first_anno.idx)
if image_anno:
    if first_anno.idx == image_anno.idx:
        is_first_image = True
    image_anno.timestamp_lock = datetime.now()