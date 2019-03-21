from flask import Flask
from lost import settings
from lost.taskman import make_celery
from flask_mail import Mail
import os
import traceback 

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


app.config['MAIL_SERVER'] = settings.MAIL_SERVER
app.config['MAIL_PORT'] = settings.MAIL_PORT
app.config['MAIL_USE_SSL'] = settings.MAIL_USE_SSL
app.config['MAIL_USE_TLS'] = settings.MAIL_USE_TLS
app.config['MAIL_USERNAME'] = settings.MAIL_USERNAME
app.config['MAIL_PASSWORD'] = settings.MAIL_PASSWORD
app.config['MAIL_DEFAULT_SENDER'] = settings.MAIL_DEFAULT_SENDER
mail = None
if settings.LOST_CONFIG.send_mail:
    try:
        mail = Mail()
        mail.init_app(app)
    except:
        msg = "Wrong Email Configuration. Adapt Email Settings in .env file ! \n"
        msg += traceback.format_exc()
        app.logger.error(msg)


blacklist = set()