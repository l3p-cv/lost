from lost.db import access, dtype
from lost.logic import sia
from lost.settings import DATA_URL, LOST_CONFIG

USER_ID = 7


def get_sia_anno_task(db_man, user_id):
    for cat in db_man.get_choosen_annotask(user_id):
        if cat.anno_task.dtype == dtype.AnnoTask.SIA:
            return cat.anno_task
    return None


user_id = USER_ID
last_img_id = 171221
db_man = access.DBMan(LOST_CONFIG)
# at = get_sia_anno_task(db_man, user_id)
# iteration = db_man.get_pipe_element(pipe_e_id=at.pipe_element_id).iteration
# image_anno = db_man.get_previous_sia_anno(at.idx, user_id, img_id, iteration)

# re = sia.get_next(db_man, user_id,last_img_id, DATA_URL)
# print(re)


is_last = False
while not is_last:
    print(last_img_id)
    re = sia.get_next(db_man, user_id, last_img_id, DATA_URL)
    if last_img_id == re["image"]["id"]:
        print(f"equal id of last_img and next_img: {last_img_id}")
    last_img_id = re["image"]["id"]
    is_last = re["image"]["isLast"]
