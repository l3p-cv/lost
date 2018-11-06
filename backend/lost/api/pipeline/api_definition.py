from flask_restplus import fields
from lost.api.api import api


template  = api.model('Template', {
    'id': fields.Integer()
})
templates = api.model('Templates', {
    'templates': fields.List(fields.Nested(template))
})
pipeline = api.model('Pipeline', {
    'id': fields.Integer()
})
pipelines = api.model('Pipelines', {
    'pipelines': fields.List(fields.Nested(pipeline))
})