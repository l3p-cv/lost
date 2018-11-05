from flask_restplus import fields

from lost.api.api import api

user = api.model('User', {
    'idx': fields.Integer(readOnly=True, description='The identifier of the user'),
    'email': fields.String(required=True, description='User email'),
    #'password': fields.String(required=True, description='User password')
})

user_login = api.model('User', {
    'email': fields.String(required=True, description='User email'),
    'password': fields.String(required=True, description='User password')
})

pagination = api.model('One page of users', {
    'page': fields.Integer(description='Current page'),
    'pages': fields.Integer(description='Total pages'), 
    'items_per_page': fields.Integer(description='Items per page'),
    'total_items': fields.Integer(description='Total amount of items')
})
users = api.model('Users', {
   'users': fields.List(fields.Nested(user_login))
})

page_with_users = api.inherit('Page with users', pagination, {
    'user': fields.List(fields.Nested(user))
})