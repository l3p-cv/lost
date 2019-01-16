from flask_restplus import fields

from lost.api.api import api
from lost.api.group.api_definition import group

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
    'new_password': fields.String(required=True, description='User password'),
    'groups': fields.List(fields.Nested(group)), 
    'roles': fields.List(fields.Nested(user_role)),
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
