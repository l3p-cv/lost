from flask_restx import fields

from lost.api.api import api

group = api.model('Group', {
    'idx': fields.Integer(readOnly=True, description='The identifier of the group.'),
    'name': fields.String(required=True, description='The name of the group.')
})

group_list = api.model('GroupList', {
    'groups': fields.List(fields.Nested(group)),
})
