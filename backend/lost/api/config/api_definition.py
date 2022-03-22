from flask_restx import fields
from lost.api.api import api


config = api.model('Config', {
    'defaultValue': fields.String(description='TODO', attribute='default_value'),
    'description': fields.String(description='TODO'),
    'idx': fields.Integer(readOnly=True, description='TODO'),
    'key': fields.String(description='TODO'),
    'config': fields.String(description="TODO"),
    'timestamp': fields.Integer(description='TODO'),
    'userId': fields.Integer(readOnly=True, description='TODO', attribute='user_id'),
    'value': fields.String(description='TODO'),
})
