from lost.db.access import DBMan
from lost.logic.pipeline import service as pipeline
from lostconfig import LOSTConfig
# from celery.utils.log import get_task_logger

def delete_pipe(pipe_id):
    # logger = get_task_logger(__name__)
    # logger.info("DELETED BY CELERY {}".format(pipe_id))
    lostconfig = LOSTConfig()
    dbm = DBMan(lostconfig)
    pipeline.delete(dbm, pipe_id)
    dbm.close_session()

