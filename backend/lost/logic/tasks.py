from __future__ import absolute_import, unicode_literals
from celery import task
from lost.logic.jobs import celery_cron

@task
def exec_pipe():
    celery_cron.exec_pipe()
    
@task
def release_annos():
    celery_cron.release_annos()