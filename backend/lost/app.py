from flask import Flask, Blueprint
from lost import settings
from lost.api.myapi import api
from lost.api.shop.endpoints.products import namespace as productnamespace
from lost.database.db import db

app = Flask(__name__)

def configure_app(app):
    app.config['SERVER_NAME'] = settings.FLASK_SERVER_NAME
    app.config['SWAGGER_UI_DOC_EXPANSION'] = settings.RESTPLUS_SWAGGER_EXPANSIONS
    app.config['RESTPLUS_VALIDATE'] = settings.RESTPLUS_VAL
    app.config['RESTPLUS_MASK_SWAGGER'] = settings.RESTPLUS_MASK_SWAGGER
    app.config['SQLALCHEMY_DATABASE_URI'] = settings.SQLALCHEMY_DATABASE_URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = settings.SQLALCHEMY_TRACK_MODS

def init_app(app):
    configure_app(app)
    blueprint = Blueprint('api', __name__, url_prefix='/api')
    api.init_app(blueprint)
    api.add_namespace(productnamespace)
    app.register_blueprint(blueprint)
    db.init_app(app)

def main():
    init_app(app)
    app.run(debug=settings.FLASK_DEBUG, threaded=settings.FLASK_THREADED)

if __name__ == "__main__":
    main()