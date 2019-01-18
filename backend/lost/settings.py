import os
from lost.logic.config import LOSTConfig

FLASK_DEBUG = True
FLASK_THREADED = True

RESTPLUS_SWAGGER_EXPANSIONS = 'list'
RESTPLUS_VAL = True
RESTPLUS_MASK_SWAGGER = False

LOST_CONFIG = LOSTConfig()

# Flask settings
SECRET_KEY = 'Test'

# Flask-Mail SMTP server settings
MAIL_SERVER = 'smtp.gmail.com'
MAIL_PORT = 465
MAIL_USE_SSL = True
MAIL_USE_TLS = False
MAIL_USERNAME = 'email@example.com'
MAIL_PASSWORD = 'password'
MAIL_DEFAULT_SENDER = '"MyApp" <noreply@example.com>'

# Flask-User settings
USER_APP_NAME = "LOST"      # Shown in and email templates and page footers
USER_ENABLE_EMAIL = True        # Enable email authentication
USER_ENABLE_USERNAME = False    # Disable username authentication
USER_EMAIL_SENDER_NAME = USER_APP_NAME
USER_EMAIL_SENDER_EMAIL = "noreply@example.com"

CORS_HEADERS = 'Content-Type'

DATA_URL = 'data/'

CELERY_BROKER_URL = 'amqp://'+LOST_CONFIG.rabbitmq_ip+':'+LOST_CONFIG.rabbitmq_port
CELERY_RESULT_BACKEND = 'amqp://'+LOST_CONFIG.rabbitmq_ip+':'+LOST_CONFIG.rabbitmq_port
