from flask_restplus import fields
from lost.api.api import api


template_element = api.model('Template element',{
    'peN': fields.Integer(description="Number of element."),
    'peOut': fields.List(fields.Integer, description='Elements output.'),
    'datasource': fields.Raw(),
    'script': fields.Raw(),
    'annoTask': fields.Raw(),
    'loop': fields.Raw(),
    'dataExport': fields.Raw(),
})
template  = api.model('Template', {
    'id': fields.Integer(readOnly=True, description="The identifier of the pipeline template."),
    'description': fields.String(readOnly=True, description="The description of the pipeline template."),
    'author': fields.String(readOnly=True, description="The author of the pipeline template."),
    'namespace': fields.String(readOnly=True, description="The namespace of the pipeline template."),
    'name': fields.String(readOnly=True, description="The name of the pipeline template."),
    'elements': fields.List(fields.Nested(template_element))
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