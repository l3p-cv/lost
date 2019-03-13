from flask_mail import Message
from lost.flaskapp import app, mail
from lost.settings import LOST_CONFIG

def send_script_error(pipe, pipe_element):
    if LOST_CONFIG.send_mail:
        with app.app_context():
            msg = Message("LOST: Script Error in Pipeline '{}'".format(pipe.name),
                    sender=LOST_CONFIG.mail_default_sender,
                    recipients=["gereon.reus@et.hs-fulda.de"])
            msg.html = "<b>Hi Das ist ein Test.</b><p>{}</p>".format(pipe_element.error_msg)
            mail.send(msg)