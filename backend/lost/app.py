import threading
from flask import Flask, Blueprint, g
from flask_cors import CORS
from flask import request
from flask_jwt_extended import JWTManager
import logging
import traceback
from lost import settings
from lost.api.api import api
from lost.api.user.endpoint import namespace as user_namespace
from lost.api.group.endpoint import namespace as group_namespace
from lost.api.sia.endpoint import namespace as sia_namespace
from lost.api.mia.endpoint import namespace as mia_namespace
from lost.api.pipeline.endpoint import namespace as pipeline_namespace
from lost.api.annotask.endpoint import namespace as annotask_namespace
from lost.api.data.endpoint import namespace as data_namespace
from lost.api.label.endpoint import namespace as label_namespace
from lost.api.worker.endpoint import namespace as worker_namespace
from lost.api.filebrowser.endpoint import namespace as filebrowser_namespace
from lost.api.statistics.endpoint import namespace as statistics_namespace
from lost.api.system.endpoint import namespace as system_namespace
from lost.api.config.endpoint import namespace as config_namespace
from lost.api.anno_example.endpoint import namespace as anno_example_namespace
from lost.logic import dask_session
from lost.db import access

from flaskapp import app, blacklist


if settings.LOST_CONFIG.use_graylog:
    from pygelf import GelfUdpHandler
    logging.basicConfig(level=logging.INFO)
    from flask.logging import default_handler
    app.logger.removeHandler(default_handler)
    app.logger.addHandler(GelfUdpHandler(host='graylog', port=12201,  _type='lost-api', include_extra_fields=True))
    app.logger.info('Started LOST Flask Application.')  


app.config['SWAGGER_UI_DOC_EXPANSION'] = settings.RESTPLUS_SWAGGER_EXPANSIONS
app.config['RESTPLUS_VALIDATE'] = settings.RESTPLUS_VAL
app.config['RESTPLUS_MASK_SWAGGER'] = settings.RESTPLUS_MASK_SWAGGER
app.config['SECRET_KEY'] = settings.SECRET_KEY
app.config['USER_APP_NAME'] = settings.USER_APP_NAME
app.config['USER_ENABLE_EMAIL'] = settings.USER_ENABLE_EMAIL
app.config['USER_ENABLE_USERNAME'] = settings.USER_ENABLE_USERNAME
app.config['USER_EMAIL_SENDER_NAME'] = settings.USER_EMAIL_SENDER_NAME
app.config['USER_EMAIL_SENDER_EMAIL'] = settings.USER_EMAIL_SENDER_EMAIL
app.config['CORS_HEADERS'] = settings.CORS_HEADERS

jwt = JWTManager(app)


@jwt.token_in_blacklist_loader
def check_if_token_in_blacklist(decrypted_token):
    jti = decrypted_token['jti']
    return jti in blacklist


@jwt.user_claims_loader
def add_claims_to_jwt(identity):
    dbm = access.DBMan(settings.LOST_CONFIG)
    roles = []
    for role in dbm.get_user_roles(user_id=identity):
        roles.append(dbm.get_role(role_id=role.role_id).name)
    dbm.close_session()
    return {"roles": roles}


# blueprint = Blueprint('api', __name__, url_prefix='/api', static_folder='/home/lost/data/static')
blueprint = Blueprint('api', __name__, url_prefix='/api')

api.init_app(blueprint)
# register endpoints here
api.add_namespace(user_namespace)
api.add_namespace(group_namespace)
api.add_namespace(sia_namespace)
api.add_namespace(mia_namespace)
api.add_namespace(pipeline_namespace)
api.add_namespace(annotask_namespace)
api.add_namespace(data_namespace)
api.add_namespace(label_namespace)
api.add_namespace(worker_namespace)
api.add_namespace(filebrowser_namespace)
api.add_namespace(system_namespace)
api.add_namespace(statistics_namespace)
api.add_namespace(config_namespace)
api.add_namespace(anno_example_namespace)
app.register_blueprint(blueprint)
CORS(app)

@app.errorhandler(Exception)
def handle_500(e):
    app.logger.error(traceback.format_exc())
    # original = getattr(e, "original_exception", None)
    # if original is None:
    #     app.logger.error(e)
    # else:
    #     app.logger.error(original) 
    return 'error', 500

import time

@app.before_request
def before_request():
    g.start = time.time()

@app.after_request
def after_request(response):
    if settings.LOST_CONFIG.use_graylog:
        diff = time.time() - g.start
        if ((response.response) and
            (200 <= response.status_code < 300) and
            (response.content_type.startswith('text/html'))):
            response.set_data(response.get_data().replace(
                b'__EXECUTION_TIME__', bytes(str(diff), 'utf-8')))
        app.logger.info('Webservice Meta Info', extra={'response_time': diff, 
                                            'response_code': response.status_code,
                                            })
    return response



def main():
    if settings.LOST_CONFIG.worker_management == 'dynamic':
        t = threading.Thread(
            target=dask_session.release_client_by_timeout_loop,
            args=(app.logger.name,),
            daemon=True
        )
        t.start()
    app.run(debug=settings.FLASK_DEBUG, threaded=settings.FLASK_THREADED)


if __name__ == "__main__":
    main()
