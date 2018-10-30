from flask import Flask, Blueprint
from flask_jwt_extended import JWTManager
from flask_user import UserManager
from lost import settings

from lost.api.api import api

from lost.api.user.endpoints.login import namespace as login_namespace
from lost.api.user.endpoints.users import namespace as users_namespace

from lost.database.db import db
from lost.database.models import User, Role, UserRoles

app = Flask(__name__)

def configure_app(app):
    app.config['SERVER_NAME'] = settings.FLASK_SERVER_NAME
    app.config['SWAGGER_UI_DOC_EXPANSION'] = settings.RESTPLUS_SWAGGER_EXPANSIONS
    app.config['RESTPLUS_VALIDATE'] = settings.RESTPLUS_VAL
    app.config['RESTPLUS_MASK_SWAGGER'] = settings.RESTPLUS_MASK_SWAGGER
    app.config['SQLALCHEMY_DATABASE_URI'] = settings.SQLALCHEMY_DATABASE_URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = settings.SQLALCHEMY_TRACK_MODS
    app.config['SECRET_KEY'] = settings.SECRET_KEY
    app.config['MAIL_SERVER'] = settings.MAIL_SERVER
    app.config['MAIL_PORT'] = settings.MAIL_PORT
    app.config['MAIL_USE_SSL'] = settings.MAIL_USE_SSL
    app.config['MAIL_USE_TLS'] = settings.MAIL_USE_TLS
    app.config['MAIL_USERNAME'] = settings.MAIL_USERNAME
    app.config['MAIL_PASSWORD'] = settings.MAIL_PASSWORD
    app.config['MAIL_DEFAULT_SENDER'] = settings.MAIL_DEFAULT_SENDER
    app.config['USER_APP_NAME'] = settings.USER_APP_NAME
    app.config['USER_ENABLE_EMAIL'] = settings.USER_ENABLE_EMAIL
    app.config['USER_ENABLE_USERNAME'] = settings.USER_ENABLE_USERNAME
    app.config['USER_EMAIL_SENDER_NAME'] = settings.USER_EMAIL_SENDER_NAME
    app.config['USER_EMAIL_SENDER_EMAIL'] = settings.USER_EMAIL_SENDER_EMAIL

def init_app(app):
    configure_app(app)
    jwt = JWTManager(app)

    @jwt.user_claims_loader
    def add_claims_to_jwt(identity):
        roles = []
        for role in UserRoles.query.filter_by(user_id=identity):
            roles.append(Role.query.filter_by(id=role.role_id).first().name)
        return {"roles": roles}
        
    blueprint = Blueprint('api', __name__, url_prefix='/api')
    api.init_app(blueprint)
    #register endpoints here
    api.add_namespace(login_namespace)
    api.add_namespace(users_namespace)
    app.register_blueprint(blueprint)
    db.init_app(app)
    # Setup Flask-User and specify the User data-model
    user_manager = UserManager(app, db, User)


def main():
    init_app(app)
    app.run(debug=settings.FLASK_DEBUG, threaded=settings.FLASK_THREADED)

if __name__ == "__main__":
    main()
