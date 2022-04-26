import datetime

from numpy.core.numeric import identity
from flask_restx import Resource
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, jwt_refresh_token_required, get_jwt_identity, get_raw_jwt
from lost.api.api import api
from lost.api.user.api_definition import user, user_list, user_login
from lost.api.user.parsers import login_parser, create_user_parser, update_user_parser
from lost.settings import LOST_CONFIG, FLASK_DEBUG
from lost.db import access, roles
from lost.db.model import User as DBUser, Group, UserRoles, UserGroups
from lost.logic import email 
from lost.logic.user import get_user_default_group, release_user_annos
from flaskapp import blacklist
from lost.logic import dask_session
from lost.api.user.login_manager import LoginManager
from lost.logic.file_access import UserFileAccess, create_user_default_fs
namespace = api.namespace('user', description='Users in System.')

@namespace.route('')
@api.doc(description='User Api get method.')
class UserList(Resource):
    @api.marshal_with(user_list)
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ADMINISTRATOR):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            users = dbm.get_users()
            for us in users:
                for g in us.groups:
                    if g.group.is_user_default:
                        us.groups.remove(g)
            dbm.close_session()
            ulist = {'users':users}
            return ulist 
            
    @jwt_required 
    @api.expect(create_user_parser)
    def post(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ADMINISTRATOR):
            dbm.close_session()
            return "You are not authorized.", 401
        # get data from parser
        data = create_user_parser.parse_args()
        # find user in database
        user = None
        if 'email' in data:
            user = dbm.find_user_by_email(data['email'])
        if not user and 'user_name' in data:
            user = dbm.find_user_by_user_name(data['user_name'])

        if user:
            return {'message': 'User already exists.'}, 401
        else: 
            user = DBUser(
            user_name = data['user_name'],
            email = data['email'],
            email_confirmed_at=datetime.datetime.utcnow(),
            password= data['password'],
            )
            dbm.save_obj(user)
            # create user's default group
            g = Group(name=user.user_name, is_user_default=True)
            dbm.save_obj(g)
            ug = UserGroups(group_id=g.idx,user_id=user.idx)
            dbm.save_obj(ug)
            # create user's default role
            anno_role = dbm.get_role_by_name(roles.ANNOTATOR)
            ur = UserRoles(user_id=user.idx, role_id=anno_role.idx)
            dbm.save_obj(ur)
            
            if data['roles']:
                role_ids = [db_role.role_id for db_role in dbm.get_user_roles(user.idx)]
                for role_name in data['roles']:
                    for item in [item for item in dir(roles) if not item.startswith("__")]:
                        name = getattr(roles, item)
                        if role_name == name:
                            role = dbm.get_role_by_name(name)
                            if not role.idx in role_ids:
                                ur = UserRoles(user_id=user.idx, role_id=role.idx)
                                dbm.save_obj(ur)
            
            if data['groups']:
                for group_name in data['groups']:
                    group = dbm.get_group_by_name(group_name)
                    if group:
                        ug = UserGroups(group_id=group.idx, user_id=user.idx)
                        dbm.save_obj(ug)
            dbm.save_obj(user)


            if user.has_role(roles.DESIGNER) or user.has_role(roles.ADMINISTRATOR):
                expires = datetime.timedelta(days=365000)
                api_token = create_access_token(identity=user.idx, expires_delta=expires)
                user.api_token = api_token
                dbm.save_obj(user)
                create_user_default_fs(dbm, user, g.idx)
            try:
                email.send_new_user(user,data['password'])
            except:
                pass
            dbm.close_session()
            return {
                'message': 'success'
            }, 200
         
@namespace.route('/anno_task_user')
@api.doc(description='User Api get method for anno task users.')
class UserListAnnoTask(Resource):
    @api.marshal_with(user_list)
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            users = dbm.get_users()
            dbm.close_session()
            ulist = {'users':users}
            return ulist 

@namespace.route('/<int:id>')
@namespace.param('id', 'The user identifier')
class User(Resource):
    @api.marshal_with(user)
    @jwt_required 
    def get(self, id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ADMINISTRATOR):
            dbm.close_session()
            return "You are not authorized.", 401

        requesteduser = dbm.get_user_by_id(id)
        dbm.close_session()
        if requesteduser:
            return requesteduser
        else:
            return "User with ID '{}' not found.".format(id)

    @jwt_required 
    def delete(self, id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ADMINISTRATOR):
            dbm.close_session()
            return "You are not authorized.", 401

        requesteduser = dbm.get_user_by_id(id)
        
        if requesteduser.idx == user.idx:
            dbm.close_session()
            return "You are not able to delete yourself", 400

        if requesteduser:
            for g in requesteduser.groups:
                    if g.group.is_user_default:
                        dbm.delete(g.group)
                        dbm.commit()
                        dbm.delete(g)
                        dbm.commit()
            for r in requesteduser.roles:
                    dbm.delete(r)
                    dbm.commit()
            dbm.delete(requesteduser) 
            dbm.commit()
            fs_db = dbm.get_user_default_fs(requesteduser.idx)
            ufa = UserFileAccess(dbm, requesteduser, fs_db)
            ufa.delete_user_default_fs()
            dbm.close_session()
            return 'success', 200 
        else:
            dbm.close_session()
            return "User with ID '{}' not found.".format(id), 400
    
    @jwt_required 
    @api.expect(update_user_parser)
    def patch(self, id):
        args = update_user_parser.parse_args()
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ADMINISTRATOR):
            dbm.close_session()
            return "You are not authorized.", 401

        requesteduser = dbm.get_user_by_id(id)
         
        if requesteduser:
            if not requesteduser.is_external:
                requesteduser.email = args.get('email')
                requesteduser.first_name = args.get('first_name')
                requesteduser.last_name = args.get('last_name')

            for user_role in dbm.get_user_roles_by_user_id(id):
                if requesteduser.user_name != 'admin': 
                    dbm.delete(user_role) 
                    dbm.commit()
            
            user_default_group_id = get_user_default_group(dbm, requesteduser.idx)
            user_role_list = []
            if requesteduser.user_name != 'admin': 
                if args.get('roles'):
                    for role_name in args.get('roles'):
                        for item in [item for item in dir(roles) if not item.startswith("__")]:
                            name = getattr(roles, item)
                            if role_name == name:
                                role = dbm.get_role_by_name(name) 
                                user_role_list.append(role)
                                ur = UserRoles(user_id=requesteduser.idx, role_id=role.idx)
                                dbm.save_obj(ur)

            if len(user_role_list) == 1:
                if requesteduser.has_role(roles.ANNOTATOR):
                    # raise Exception(user_role_list)
                    fs_db = dbm.get_user_default_fs(requesteduser.idx)
                    if fs_db:
                        ufa = UserFileAccess(dbm, requesteduser, fs_db)
                        ufa.delete_user_default_fs()
                else:
                    create_user_default_fs(dbm, requesteduser, user_default_group_id)
            else:
                create_user_default_fs(dbm, requesteduser, user_default_group_id)

            for user_group in dbm.get_user_groups_by_user_id(id):
                if user_group.group.is_user_default:
                    continue
                dbm.delete(user_group)
                dbm.commit()
            if args.get('groups'):
                for group_name in args.get('groups'):
                    group = dbm.get_group_by_name(group_name)
                    if group:
                        ug = UserGroups(user_id=requesteduser.idx, group_id=group.idx)
                        dbm.save_obj(ug)
            if args.get('password') and not requesteduser.is_external:
                requesteduser.set_password(args.get('password'))

            dbm.save_obj(requesteduser)
            dbm.close_session()
            return 'success', 200 
        else:
            dbm.close_session()
            return "User with ID '{}' not found.".format(id), 400

    
 
@namespace.route('/self')
class UserSelf(Resource):
    @api.marshal_with(user)
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        dbm.close_session()
        if user:
            return user
        else:
            return "No user found."

    @api.expect(update_user_parser)
    @jwt_required 
    def patch(self):
        args = update_user_parser.parse_args()
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if user:
            user.email = args.get('email') 
            user.first_name = args.get('first_name')
            user.last_name = args.get('last_name')
            if args.get('password'):
                user.set_password(args.get('password'))
            dbm.save_obj(user)
            dbm.close_session()
            return 'success', 200
        else:
            dbm.close_session()
            return "No user found.", 405

@namespace.route('/logout')
class UserLogout(Resource):
    @jwt_required 
    def post(self):
        identity = get_jwt_identity()
        dbm = access.DBMan(LOST_CONFIG)
        release_user_annos(dbm, identity)
        user = dbm.get_user_by_id(identity)
        if LOST_CONFIG.worker_management == 'dynamic':
            dask_session.ds_man.shutdown_cluster(user)
        dbm.close_session()
        jti = get_raw_jwt()['jti'] 
        blacklist.add(jti)
        return {"msg": "Successfully logged out"}, 200

@namespace.route('/logout2')
class UserLogoutRefresh(Resource):
    @jwt_refresh_token_required
    def post(self):
        jti = get_raw_jwt()['jti']
        blacklist.add(jti)
        return {"msg": "Successfully logged out"}, 200

@namespace.route('/refresh')
class UserTokenRefresh(Resource):
    @jwt_refresh_token_required
    def post(self):
        dbm = access.DBMan(LOST_CONFIG) 
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if LOST_CONFIG.worker_management == 'dynamic':
            dask_session.ds_man.refresh_user_session(user)
        expires = datetime.timedelta(minutes=LOST_CONFIG.session_timeout)
        expires_refresh = datetime.timedelta(minutes=LOST_CONFIG.session_timeout + 2)
        if user:
            access_token = create_access_token(identity=user.idx, fresh=True, expires_delta=expires)
            refresh_token = create_refresh_token(user.idx, expires_delta=expires_refresh)
            ret = {
                'token': access_token,
                'refresh_token': refresh_token
            }
            dbm.close_session()
            return ret, 200
        dbm.close_session()
        return {'message': 'Invalid user'}, 401

@namespace.route('/login')
class UserLogin(Resource):
    @api.expect(user_login)
    def post(self):
        # get data from parser
        data = login_parser.parse_args()
        dbm = access.DBMan(LOST_CONFIG)
        user = dbm.find_user_by_user_name(data['userName'])
        lm = LoginManager(dbm, data['userName'], data['password'])
        response = lm.login()
        if LOST_CONFIG.worker_management == 'dynamic':
            if response[1] == 200:
                dask_session.ds_man.create_user_cluster(user)
        dbm.close_session()
        return response

@namespace.route('/token') 
class Token(Resource):
    @api.expect(user_login)
    def post(self):
        # get data from parser
        data = login_parser.parse_args()
        dbm = access.DBMan(LOST_CONFIG)
        # find user in database
        if 'user_name' in data:
            user = dbm.find_user_by_user_name(data['user_name'])

        # check password
        if user and user.check_password(data['password']):
            dbm.close_session()
            expires = datetime.timedelta(days=3650)
            access_token = create_access_token(identity=user.idx, fresh=True, expires_delta=expires)
            return {
                'token': access_token
            }, 200
        dbm.close_session()
        return {'message': 'Invalid credentials'}, 401