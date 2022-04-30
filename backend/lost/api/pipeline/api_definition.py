from flask_restx import fields
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
    'group_id': fields.Integer(readOnly=True, description="Group id."),
    'pipeProject': fields.String(readOnly=True, description="Pipe Project the pipeline belongs to."),
    'description': fields.String(readOnly=True, description="The description of the pipeline template."),
    'author': fields.String(readOnly=True, description="The author of the pipeline template."),
    'namespace': fields.String(readOnly=True, description="The namespace of the pipeline template."),
    'name': fields.String(readOnly=True, description="The name of the pipeline template."),
    'date': fields.DateTime(readOnly=True, description="Timestamp when template was imported."),
    'availableLabelTrees': fields.Raw(readOnly=True, description="All available label trees in system."),
    'availableGroups': fields.Raw(readOnly=True, description="All available groups for the user."),
    'pipelineCount': fields.Raw(readOnly=True, description="Number of pipelines started with this template."),
    'elements': fields.Raw()
    #'elements': fields.List(fields.Nested(template_element))
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