from flask import Flask
from lost import settings
from lost.taskman import make_celery
from lost.logic.file_man import FileMan
from flask_mail import Mail
import os
import traceback 

app = Flask(__name__)

import logging
from logging import StreamHandler

file_man = FileMan(settings.LOST_CONFIG)
logfile_path = file_man.get_app_log_path('flask.log')
log_file_stream = file_man.fs.open(logfile_path, 'a')
sh = StreamHandler(log_file_stream)
# sh = FileHandler(os.path.join(settings.LOST_CONFIG.project_path,'logs','flask.log'))
if settings.LOST_CONFIG.debug:
    logging.basicConfig(level=logging.INFO)
    sh.setLevel(logging.INFO)
else:
    sh.setLevel(logging.WARNING)
formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
sh.setFormatter(formatter)
app.logger.addHandler(sh)

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