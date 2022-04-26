from flask_mail import Message
from lost.flaskapp import app, mail
from lost.settings import LOST_CONFIG
from flask import render_template
from lost.db import dtype

def send_email(subject, recipients, html_body):
    if LOST_CONFIG.send_mail:
        msg = Message(subject, sender=LOST_CONFIG.mail_default_sender, recipients=recipients)
        msg.html = html_body
        mail.connect()
        mail.send(msg)


def send_script_error(pipe, pipe_element):
    with app.app_context():
        for ug in pipe.group.users:
            send_email("LOST: Script Error in Pipeline '{}'".format(pipe.name),
                    [ug.user.email],
                    render_template("email/script_error.html", 
                                    user = ug.user, pipe=pipe, pipe_element=pipe_element, lost_url=LOST_CONFIG.mail_lost_url))

def send_annotask_available(dbm, annotask):
    size = 'unknown'
    for r in dbm.count_all_image_annos(annotask.idx, annotask.pipe_element.iteration)[0]:
        size = r
    annotype = 'unknown'
    if annotask.dtype == dtype.AnnoTask.MIA:
        annotype = 'MIA'
    elif annotask.dtype == dtype.AnnoTask.SIA:
        annotype = 'SIA'
    with app.app_context():
        for ug in annotask.group.users:
            send_email("LOST: New AnnotationTask available !",
                [ug.user.email],
                render_template("email/new_annotask.html", 
                                user = ug.user, 
                                annotask=annotask, 
                                type=annotype, 
                                size=size, 
                                lost_url=LOST_CONFIG.mail_lost_url, 
                                number_assignees=len(list(annotask.group.users))))

def send_pipeline_finished(pipe):
    with app.app_context():
        for ug in pipe.group.users:
            send_email("LOST: Pipeline '{}' has been finished.".format(pipe.name),
                        [ug.user.email],
                        render_template("email/pipeline_finished.html", 
                                        user = ug.user, pipe=pipe, lost_url=LOST_CONFIG.mail_lost_url))

def send_annotask_finished(dbm, annotask):
        size = 'unknown'
        for r in dbm.count_all_image_annos(annotask.idx, annotask.pipe_element.iteration)[0]:
            size = r
        annotype = 'unknown'
        if annotask.dtype == dtype.AnnoTask.MIA:
            annotype = 'MIA'
        elif annotask.dtype == dtype.AnnoTask.SIA:
            annotype = 'SIA'
        with app.app_context():
            for ug in annotask.pipe_element.pipe.group.users:
                send_email("LOST: AnnotationTask '{}' has been finished.".format(annotask.name),
                    [ug.user.email],
                    render_template("email/annotask_finished.html", 
                                    user = ug.user, 
                                    annotask=annotask, 
                                    type=annotype, 
                                    size=size, 
                                    lost_url=LOST_CONFIG.mail_lost_url, 
                                    number_assignees=len(list(annotask.group.users))))

def send_new_user(user, password):
        send_email("LOST: User account '{}' has been created.".format(user.user_name),
            [user.email],
            render_template("email/new_user.html", 
                            user = user, password=password, lost_url=LOST_CONFIG.mail_lost_url))

