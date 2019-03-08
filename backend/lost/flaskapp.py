from flask import Flask
from lost import settings
from lost.taskman import make_celery
import os 

app = Flask(__name__)

import logging
from logging import FileHandler
file_handler = FileHandler(os.path.join(settings.LOST_CONFIG.project_path,'logs','flask.log'))
file_handler.setLevel(logging.WARNING)
formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
file_handler.setFormatter(formatter)
app.logger.addHandler(file_handler)

app.config['CELERY_BROKER_URL'] = settings.CELERY_BROKER_URL
app.config['CELERY_RESULT_BACKEND'] = settings.CELERY_RESULT_BACKEND

celery = make_celery(app)
