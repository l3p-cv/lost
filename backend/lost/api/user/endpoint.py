import datetime
from flask_restplus import Resource
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from lost.api.api import api
from lost.api.user.api_definition import user, user_list, user_login
from lost.api.user.parsers import login_parser, create_user_parser, update_user_parser
from lost.settings import LOST_CONFIG, FLASK_DEBUG
from lost.db import access, roles
from lost.db.model import User as DBUser, Role, Group
from lost.logic import email 
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
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            users = dbm.get_users()
            for us in users:
                for g in us.groups:
                    if g.is_user_default:
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
        if not user.has_role(roles.DESIGNER):
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
            anno_role = dbm.get_role_by_name(roles.ANNOTATOR)
            user.roles.append(anno_role)
            user.groups.append(Group(name=user.user_name, is_user_default=True))
            
            
            if data['roles']:
                for role_name in data['roles']:
                    if role_name == 'Designer':
                        designer_role = dbm.get_role_by_name(roles.DESIGNER)
                        user.roles.append(designer_role)        
            
            if data['groups']:
                for group_name in data['groups']:
                    group = dbm.get_group_by_name(group_name)
                    if group:
                        user.groups.append(group)
            dbm.save_obj(user)
            try:
                email.send_new_user(user,data['password'])
            except:
                pass
            dbm.close_session()
            return {
                'message': 'success'
            }, 200
         


@namespace.route('/<int:id>')
@namespace.param('id', 'The user identifier')
class User(Resource):
    @api.marshal_with(user)
    @jwt_required 
    def get(self, id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
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
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You are not authorized.", 401

        requesteduser = dbm.get_user_by_id(id)
        
        if requesteduser:
            for g in requesteduser.groups:
                    if g.is_user_default:
                        dbm.delete(g)
                        dbm.commit()
            dbm.delete(requesteduser) 
            dbm.commit()
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
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You are not authorized.", 401

        requesteduser = dbm.get_user_by_id(id)
         
        if requesteduser:
            requesteduser.email = args.get('email')
            requesteduser.first_name = args.get('first_name')
            requesteduser.last_name = args.get('last_name')

    

            if roles.DESIGNER not in args.get('roles'):
                for user_role in dbm.get_user_roles_by_user_id(id):
                    if user_role.role.name == roles.DESIGNER: 
                        dbm.delete(user_role) 
                        dbm.commit()   

            if args.get('roles'):
                for role_name in args.get('roles'):
                    if role_name == 'Designer':
                        designer_role = dbm.get_role_by_name(roles.DESIGNER)
                        requesteduser.roles.append(designer_role)        
            
            for user_group in dbm.get_user_groups_by_user_id(id):
                if user_group.group.is_user_default:
                    continue
                dbm.delete(user_group)
                dbm.commit()
            if args.get('groups'):
                for group_name in args.get('groups'):
                    group = dbm.get_group_by_name(group_name)
                    if group:
                        requesteduser.groups.append(group)
            if args.get('password'):
                print(args.get('password')) 
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
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        dbm.close_session()
        if user:
            #TODO: logout stuff
            return user
        else:
            return "No user found."

@namespace.route('/login')
class UserLogin(Resource):
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
            expires = datetime.timedelta(hours=2)
            if FLASK_DEBUG:
                expires = datetime.timedelta(days=365)
            access_token = create_access_token(identity=user.idx, fresh=True, expires_delta=expires)
            refresh_token = create_refresh_token(user.idx)
            return {
                'token': access_token,
                'refresh_token': refresh_token
            }, 200
        return {'message': 'Invalid credentials'}, 401