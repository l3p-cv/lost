FLASK_SERVER_NAME = 'localhost:1337'
FLASK_DEBUG = True
FLASK_THREADED = True

RESTPLUS_SWAGGER_EXPANSIONS = 'list'
RESTPLUS_VAL = True
RESTPLUS_MASK_SWAGGER = False

# Flask-SQLAlchemy settings
SQLALCHEMY_DATABASE_URI = 'sqlite:///db.sqlite'
SQLALCHEMY_TRACK_MODS = False

# Flask settings
SECRET_KEY = 'This is an INSECURE secret!! DO NOT use this in production!'

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