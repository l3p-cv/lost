from __future__ import absolute_import, unicode_literals
from celery import task
from lost.logic.jobs import celery_cron
from lost.db.access import DBMan
from lost.logic.config import LOSTConfig
from lost.logic.pipeline.cron import exec_script

@task
def exec_pipe():
    celery_cron.exec_pipe()
    
@task
def release_annos():
    celery_cron.release_annos()

@task
def celery_exec_script(pipe_element_id):
    db_man = DBMan(LOSTConfig())
    exec_script(db_man,arg1,arg2,arg3)
    db_man.close_session()
