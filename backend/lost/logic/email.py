import smtplib
from email.message import EmailMessage
from pathlib import Path

from jinja2 import Environment, FileSystemLoader

from lost.db import dtype
from lost.settings import LOST_CONFIG


# Templates are in lost/templates/email/
template_env = Environment(
    loader=FileSystemLoader(Path(__file__).resolve().parent.parent / "templates"),
    autoescape=True,
)


def render_template(template_name, **context):
    return template_env.get_template(template_name).render(**context)


def send_email(subject, recipients, html_body):
    if LOST_CONFIG.send_mail:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = LOST_CONFIG.mail_default_sender
        msg["To"] = ", ".join(recipients)
        msg.set_content(html_body, subtype="html")

        with smtplib.SMTP(LOST_CONFIG.mail_server, LOST_CONFIG.mail_port) as smtp:
            if LOST_CONFIG.mail_use_tls:
                smtp.starttls()
            if LOST_CONFIG.mail_username:
                smtp.login(LOST_CONFIG.mail_username, LOST_CONFIG.mail_password)
            smtp.send_message(msg)


def send_script_error(pipe, pipe_element):
    for ug in pipe.group.users:
        send_email(
            f"LOST: Script Error in Pipeline '{pipe.name}'",
            [ug.user.email],
            render_template(
                "email/script_error.html",
                user=ug.user,
                pipe=pipe,
                pipe_element=pipe_element,
                lost_url=LOST_CONFIG.mail_lost_url,
            ),
        )


def send_annotask_available(dbm, annotask):
    size = "unknown"
    for r in dbm.count_all_image_annos(annotask.idx, annotask.pipe_element.iteration)[0]:
        size = r
    annotype = "unknown"
    if annotask.dtype == dtype.AnnoTask.MIA:
        annotype = "MIA"
    elif annotask.dtype == dtype.AnnoTask.SIA:
        annotype = "SIA"

    for ug in annotask.group.users:
        send_email(
            "LOST: New AnnotationTask available !",
            [ug.user.email],
            render_template(
                "email/new_annotask.html",
                user=ug.user,
                annotask=annotask,
                type=annotype,
                size=size,
                lost_url=LOST_CONFIG.mail_lost_url,
                number_assignees=len(list(annotask.group.users)),
            ),
        )


def send_pipeline_finished(pipe):
    for ug in pipe.group.users:
        send_email(
            f"LOST: Pipeline '{pipe.name}' has been finished.",
            [ug.user.email],
            render_template(
                "email/pipeline_finished.html",
                user=ug.user,
                pipe=pipe,
                lost_url=LOST_CONFIG.mail_lost_url,
            ),
        )


def send_annotask_finished(dbm, annotask):
    size = "unknown"
    for r in dbm.count_all_image_annos(annotask.idx, annotask.pipe_element.iteration)[0]:
        size = r
    annotype = "unknown"
    if annotask.dtype == dtype.AnnoTask.MIA:
        annotype = "MIA"
    elif annotask.dtype == dtype.AnnoTask.SIA:
        annotype = "SIA"

    for ug in annotask.pipe_element.pipe.group.users:
        send_email(
            f"LOST: AnnotationTask '{annotask.name}' has been finished.",
            [ug.user.email],
            render_template(
                "email/annotask_finished.html",
                user=ug.user,
                annotask=annotask,
                type=annotype,
                size=size,
                lost_url=LOST_CONFIG.mail_lost_url,
                number_assignees=len(list(annotask.group.users)),
            ),
        )


def send_new_user(user, password):
    send_email(
        f"LOST: User account '{user.user_name}' has been created.",
        [user.email],
        render_template(
            "email/new_user.html",
            user=user,
            password=password,
            lost_url=LOST_CONFIG.mail_lost_url,
        ),
    )
