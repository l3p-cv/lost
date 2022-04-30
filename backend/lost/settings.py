from lostconfig import LOSTConfig

FLASK_THREADED = True

RESTPLUS_SWAGGER_EXPANSIONS = 'list'
RESTPLUS_VAL = True
RESTPLUS_MASK_SWAGGER = False

LOST_CONFIG = LOSTConfig()

FLASK_DEBUG = LOST_CONFIG.debug

# Flask settings
SECRET_KEY = LOST_CONFIG.secret_key

# Flask-Mail SMTP server settings
MAIL_SERVER = LOST_CONFIG.mail_server #'smtp.gmail.com'
MAIL_PORT = LOST_CONFIG.mail_port #465
MAIL_USE_SSL = LOST_CONFIG.mail_use_ssl #True
MAIL_USE_TLS = LOST_CONFIG.mail_use_tls #False
MAIL_USERNAME = LOST_CONFIG.mail_username #'email@example.com'
MAIL_PASSWORD = LOST_CONFIG.mail_password #'password'
MAIL_DEFAULT_SENDER = LOST_CONFIG.mail_default_sender #'"MyApp" <noreply@example.com>'

# Flask-User settings
USER_APP_NAME = "LOST"      # Shown in and email templates and page footers
USER_ENABLE_EMAIL = True        # Enable email authentication
USER_ENABLE_USERNAME = False    # Disable username authentication
USER_EMAIL_SENDER_NAME = USER_APP_NAME
USER_EMAIL_SENDER_EMAIL = "noreply@example.com"

CORS_HEADERS = 'Content-Type'

DATA_URL = 'data/'

STRF_TIME = "%Y-%m-%dT%H:%M:%S.000Z"

MAX_FILE_UPLOAD_SIZE = LOST_CONFIG.max_file_upload_size