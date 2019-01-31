from flask import Flask
from lost import settings
from lost.taskman import make_celery

app = Flask(__name__)

app.config['CELERY_BROKER_URL'] = settings.CELERY_BROKER_URL
app.config['CELERY_RESULT_BACKEND'] = settings.CELERY_RESULT_BACKEND

celery = make_celery(app)
