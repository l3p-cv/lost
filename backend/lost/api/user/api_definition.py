from flask_restx import fields

from lost.api.api import api

class Roles(fields.Raw):
    def format(self, value):
        roles = []
        for v in value:
            roles.append({
                'idx': v.role.idx,
                'name': v.role.name
            })
        return roles
class Groups(fields.Raw):
    def format(self, value):
        groups = []
        for v in value:
            groups.append({
                'idx': v.group.idx,
                'name': v.group.name
            })
        return groups

user_role = api.model('User Role', {
    'idx': fields.Integer(readOnly=True, description='The identifier of the Role'),
    'name': fields.String(description='Name of the Role')
})
user = api.model('User', {
    'idx': fields.Integer(readOnly=True, description='The identifier of the user'),
    'is_active': fields.Boolean(description="Online Status of the user"),
    'user_name': fields.String(required=True, description='User name'),
    'email': fields.String(required=True, description='User email'),
    'email_confirmed_at': fields.DateTime(description='Confirmation date of email'),
    'first_name': fields.String(required=True, description='User first name'),
    'last_name': fields.String(required=True, description='User last name'),
    'confidence_level': fields.Integer(description='Confidence level of user'),
    'photo_path': fields.String(description='Path to user avatar'),
    'apiToken': fields.String(description='API Token for permanent access', attribute='api_token'),
    'new_password': fields.String(required=True, description='User password'),
    'groups': Groups(), 
    'roles': Roles(),
    'is_external': fields.Boolean(description="User inherited from external user managament"), 
    # 'choosen_anno_task': fields.Raw()
})

user_login = api.model('UserLogin', {
    # 'email': fields.String(description='User email'),
    'user_name': fields.String(description='User name'),
    'password': fields.String(required=True, description='User password')
})

user_list = api.model('UserList', {
    'users': fields.List(fields.Nested(user)),
})
