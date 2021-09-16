import threading
from flask import Flask, Blueprint
from flask_cors import CORS
from flask import request
from flask_jwt_extended import JWTManager
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
from lost.logic import dask_session
#from lost.database.db import db
from lost.db.model import User, Role, UserRoles
from lost.db import access

from flaskapp import app

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
#register endpoints here
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
app.register_blueprint(blueprint)
CORS(app)

def main():
    if settings.LOST_CONFIG.worker_management=='dynamic':
        t = threading.Thread(
            target=dask_session.release_client_by_timeout_loop, 
            args=(app.logger.name,),
            daemon=True
        )
        t.start()
    app.run(debug=settings.FLASK_DEBUG, threaded=settings.FLASK_THREADED)

if __name__ == "__main__":
    main()