from flask import Flask
from lost import settings
# from lost.taskman import make_celery
from lost.logic.file_man import AppFileMan
from flask_mail import Mail
import os
import traceback 

app = Flask(__name__)

import logging
from logging import FileHandler

file_man = AppFileMan(settings.LOST_CONFIG)
logfile_path = file_man.get_app_log_path('flask.log')
# log_file_stream = file_man.fs.open(logfile_path, 'a')
# file_handler = StreamHandler(log_file_stream)
file_handler = FileHandler(logfile_path)
if settings.LOST_CONFIG.debug:
    logging.basicConfig(level=logging.INFO)
    file_handler.setLevel(logging.INFO)
else:
    file_handler.setLevel(logging.WARNING)
formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
file_handler.setFormatter(formatter)
app.logger.addHandler(file_handler)

app.config['MAIL_SERVER'] = settings.MAIL_SERVER
app.config['MAIL_PORT'] = settings.MAIL_PORT
app.config['MAIL_USE_SSL'] = settings.MAIL_USE_SSL
app.config['MAIL_USE_TLS'] = settings.MAIL_USE_TLS
app.config['MAIL_USERNAME'] = settings.MAIL_USERNAME
app.config['MAIL_PASSWORD'] = settings.MAIL_PASSWORD
app.config['MAIL_DEFAULT_SENDER'] = settings.MAIL_DEFAULT_SENDER
app.config['MAX_CONTENT_LENGTH'] = settings.MAX_FILE_UPLOAD_SIZE 

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