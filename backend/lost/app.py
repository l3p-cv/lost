import logging
import threading
import time
import traceback

from flask import Blueprint, g, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flaskapp import app, blacklist

from lost import settings
from lost.api.anno_example.endpoint import namespace as anno_example_namespace
from lost.api.annotasks.endpoint import namespace as annotasks_namespace
from lost.api.api import api
# config_namespace migrated to FastAPI in P1.2
# data_namespace migrated to FastAPI in P1.2

# from lost.api.annotasks.endpoint import namespace as annotasks_namespace
from lost.api.auth.OpenidEndpoint import namespace as openid_namespace
from lost.api.dataset.endpoint import namespace as dataset_namespace
# filebrowser_namespace migrated to FastAPI in P1.2
# group_namespace migrated to FastAPI in P1.2
from lost.api.inference_model.endpoint import namespace as inference_model_namespace
from lost.api.instructionmedia.endpoint import namespace as media_namespace
# instructions_namespace migrated to FastAPI in P1.2
# label_namespace migrated to FastAPI in P1.2
from lost.api.mia.endpoint import namespace as mia_namespace
from lost.api.pipeline.endpoint import namespace as pipeline_namespace
from lost.api.sia.endpoint import namespace as sia_namespace
# statistics_namespace migrated to FastAPI in P1.2
# system_namespace migrated to FastAPI in P1.2
from lost.api.triton.endpoint import namespace as triton_namespace
# user_namespace migrated to FastAPI in P1.2
# worker_namespace migrated to FastAPI in P1.2
from lost.db import access
from lost.logic import dask_session

if settings.LOST_CONFIG.use_graylog:
    from pygelf import GelfUdpHandler

    logging.basicConfig(level=logging.INFO)
    from flask.logging import default_handler

    app.logger.removeHandler(default_handler)
    app.logger.addHandler(GelfUdpHandler(host="graylog", port=12201, _type="lost-api", include_extra_fields=True))
    app.logger.info("Started LOST Flask Application.")


app.config["SWAGGER_UI_DOC_EXPANSION"] = settings.RESTX_SWAGGER_EXPANSIONS
app.config["RESTX_VALIDATE"] = settings.RESTX_VAL
app.config["RESTX_MASK_SWAGGER"] = settings.RESTX_MASK_SWAGGER
app.config["SECRET_KEY"] = settings.SECRET_KEY
app.config["USER_APP_NAME"] = settings.USER_APP_NAME
app.config["USER_ENABLE_EMAIL"] = settings.USER_ENABLE_EMAIL
app.config["USER_ENABLE_USERNAME"] = settings.USER_ENABLE_USERNAME
app.config["USER_EMAIL_SENDER_NAME"] = settings.USER_EMAIL_SENDER_NAME
app.config["USER_EMAIL_SENDER_EMAIL"] = settings.USER_EMAIL_SENDER_EMAIL
app.config["CORS_HEADERS"] = settings.CORS_HEADERS

jwt = JWTManager(app)


@jwt.token_in_blocklist_loader
def check_if_token_in_blacklist(_, payload_data):
    jti = payload_data["jti"]
    return jti in blacklist


@jwt.user_lookup_loader
def add_claims_to_jwt(_, identity):
    dbm = access.DBMan(settings.LOST_CONFIG)
    roles = []
    for role in dbm.get_user_roles(user_id=identity):
        roles.append(dbm.get_role(role_id=role.role_id).name)
    dbm.close_session()
    return {"roles": roles}


# blueprint = Blueprint('api', __name__, url_prefix='/api', static_folder='/home/lost/data/static')
blueprint = Blueprint("api", __name__, url_prefix="/api")

api.init_app(blueprint)
# register endpoints here
# user_namespace migrated to FastAPI in P1.2
api.add_namespace(openid_namespace)
# group_namespace migrated to FastAPI in P1.2
api.add_namespace(sia_namespace)
api.add_namespace(mia_namespace)
api.add_namespace(pipeline_namespace)
# api.add_namespace(annotask_namespace)
api.add_namespace(annotasks_namespace)
api.add_namespace(dataset_namespace)
# data_namespace migrated to FastAPI in P1.2
# label_namespace migrated to FastAPI in P1.2
# worker_namespace migrated to FastAPI in P1.2
# filebrowser_namespace migrated to FastAPI in P1.2
# system_namespace migrated to FastAPI in P1.2
# statistics_namespace migrated to FastAPI in P1.2
# config_namespace migrated to FastAPI in P1.2
api.add_namespace(anno_example_namespace)
# instructions_namespace migrated to FastAPI in P1.2
api.add_namespace(media_namespace)
api.add_namespace(inference_model_namespace)
api.add_namespace(triton_namespace)
app.register_blueprint(blueprint)
CORS(app)


@app.errorhandler(Exception)
def handle_500(e):
    trace = traceback.format_exc()
    app.logger.error(trace)

    # send corresponding HTTP return codes for errors
    exception_name: str = type(e).__name__
    match exception_name:
        case "NotFound":
            return str(e), 404
        case _:
            # general errors (return as 500)
            response = {"error": str(e), "type": type(e).__name__}

            # append stack trace in debug mode
            if settings.FLASK_DEBUG:
                response["traceback"] = trace.splitlines()

            return jsonify(response), 500


@app.before_request
def before_request():
    g.start = time.time()


@app.after_request
def after_request(response):
    if settings.LOST_CONFIG.use_graylog:
        diff = time.time() - g.start
        if (
            (response.response)
            and (200 <= response.status_code < 300)
            and (response.content_type.startswith("text/html"))
        ):
            response.set_data(response.get_data().replace(b"__EXECUTION_TIME__", bytes(str(diff), "utf-8")))
        app.logger.info(
            "Webservice Meta Info",
            extra={
                "response_time": diff,
                "response_code": response.status_code,
            },
        )
    return response


def main():
    if settings.LOST_CONFIG.worker_management == "dynamic":
        t = threading.Thread(
            target=dask_session.release_client_by_timeout_loop,
            args=(app.logger.name,),
            daemon=True,
        )
        t.start()
    app.run(debug=settings.FLASK_DEBUG, threaded=settings.FLASK_THREADED, host=settings.FLASK_LISTEN_HOST)


if __name__ == "__main__":
    main()
