from celery.schedules import crontab
from lost.settings import LOST_CONFIG

CELERY_IMPORTS = ('lost.logic.tasks')
CELERY_TASK_RESULT_EXPIRES = 30
CELERY_TIMEZONE = 'UTC'

CELERY_ACCEPT_CONTENT = ['json', 'msgpack', 'yaml']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'

CELERYBEAT_SCHEDULE = {
    'exec_pipe': {
        'task': 'lost.logic.tasks.exec_pipe',
        'schedule': int(LOST_CONFIG.pipe_schedule)
    }
}