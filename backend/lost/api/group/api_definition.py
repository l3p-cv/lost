from flask_restplus import fields

from lost.api.api import api

group = api.model('Group', {
    'idx': fields.Integer(readOnly=True, description='The identifier of the group.'),
    'name': fields.String(required=True, description='The name of the group.'),
    'is_user_default': fields.Boolean(description="Is default group of user.") 
})

group_list = api.model('GroupList', {
    'groups': fields.List(fields.Nested(group)),
})
