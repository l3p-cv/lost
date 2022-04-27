import datetime
from flask_ldap3_login import LDAP3LoginManager, AuthenticationResponseStatus
from lost.settings import LOST_CONFIG, FLASK_DEBUG
from flask_jwt_extended import create_access_token, create_refresh_token
from lost.db.model import User as DBUser, Group, UserRoles, UserGroups
from lost.db import roles
import flask
import traceback
class LoginManager():
    def __init__(self, dbm, user_name, password):
        self.dbm = dbm
        self.user_name = user_name
        self.password = password
    
    def login(self):
        if LOST_CONFIG.ldap_config['LDAP_ACTIVE']:
            try:
                access_token, refresh_token = self.__authenticate_ldap()
            except Exception:
                flask.current_app.logger.error('LDAP Authentication failed.')
                flask.current_app.logger.error(traceback.print_exc())
                access_token, refresh_token = self.__authenticate_flask() 
        else:
            access_token, refresh_token = self.__authenticate_flask()

        if access_token and refresh_token:
            return {
                'token': access_token,
                'refresh_token': refresh_token
            }, 200
        return {'message': 'Invalid credentials'}, 401
    
    def __get_token(self, user_id): 
        expires = datetime.timedelta(minutes=LOST_CONFIG.session_timeout)
        expires_refresh = datetime.timedelta(minutes=LOST_CONFIG.session_timeout + 2)
        access_token = create_access_token(identity=user_id, fresh=True, expires_delta=expires)
        refresh_token = create_refresh_token(user_id, expires_delta=expires_refresh)
        return access_token, refresh_token

    def __authenticate_flask(self):
        if self.user_name:
            user = self.dbm.find_user_by_user_name(self.user_name)
        if user and user.check_password(self.password):
            return self.__get_token(user.idx)
        return None, None
            
    def __authenticate_ldap(self):
        # auth with ldap
        ldap_manager = LDAP3LoginManager()
        ldap_manager.init_config(LOST_CONFIG.ldap_config)

        # Check if the credentials are correct
        response = ldap_manager.authenticate(self.user_name, self.password)
        if response.status != AuthenticationResponseStatus.success:
            # no user found in ldap, try it with db user:
            return self.__authenticate_flask()
        user_info = response.user_info
        user = self.dbm.find_user_by_user_name(self.user_name)
        # user not in db:
        if not user:
            user = self.__create_db_user(user_info)
        else:
            # user in db -> synch with ldap
            user = self.__update_db_user(user_info, user)
        return self.__get_token(user.idx)
    
    def __create_db_user(self, user_info): 
        user = DBUser(user_name=user_info['uid'], email=user_info['mail'],
                    email_confirmed_at=datetime.datetime.now(), first_name=user_info['givenName'],
                    last_name=user_info['sn'], is_external=True)
        self.dbm.save_obj(user)
        anno_role = self.dbm.get_role_by_name(roles.ANNOTATOR)
        ur = UserRoles(user_id=user.idx, role_id=anno_role.idx)
        self.dbm.save_obj(ur)
        g = Group(name=user.user_name, is_user_default=True)
        self.dbm.save_obj(g)
        ug = UserGroups(group_id=g.idx,user_id=user.idx)
        self.dbm.save_obj(ug)
        return user

    def __update_db_user(self, user_info, user):
        user.email = user_info['mail']
        user.first_name = user_info['givenName']
        user.last_name = user_info['sn']
        user.is_external=True
        self.dbm.save_obj(user)
        return user