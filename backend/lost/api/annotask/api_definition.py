

from flask_restx import fields
from lost.api.api import api

amount_per_label = api.model('Amount per Label List',{
    'label':fields.String(description='Name of the Label'),
    'amount':fields.Integer(description='Amount of the Label'),
    'color':fields.String(description='Color of the Label'),

})

statistics = api.model('Anno Task List',{
    'amountPerLabel':fields.Nested(amount_per_label,description='Amount of annos per Label',attribute='amount_per_label'),
    'secondsPerAnno':fields.String(description='Seconds taken per anno',attribute='seconds_per_anno')
})


label_leaf = api.model('Label Leaf',{
    'id':fields.Integer(description='Label ID'),
    'name':fields.String(description='Label Name'),
    'color':fields.String(description='Label Color'),

})

tool_configuration = api.model('Configuration',{
    'point':fields.Boolean(description='Enabled Status of Point annos'),
    'line':fields.Boolean(description='Enabled Status of Line annos'),
    'polygon':fields.Boolean(description='Enabled Status of Polygon annos'),
    'bbox':fields.Boolean(description='Enabled Status of BBox annos'),
    'junk':fields.Boolean(description='Enabled Status of Junk annos'),

})

anno_actions = api.model('Configuration',{
    'draw':fields.Boolean(description='Enabled Status of draw annos'),
    'label':fields.Boolean(description='Enabled Status of label annos'),
    'edit':fields.Boolean(description='Enabled Status of edit annos'),

})

anno_configuration = api.model('Configuration',{
    'multilabels':fields.Boolean(description='Enabled Status of multilabel annos'),
    'actions':fields.Nested(anno_actions,description='Anno actions'),
    'minArea':fields.Integer(description='minimal Anno area in pixels'),

})

image_actions = api.model('Configuration',{
    'label':fields.Boolean(description='Enabled Status of label annos'),

})

image_configuration = api.model('Configuration',{
    'multilabels':fields.Boolean(description='Enabled Status of multilabel annos'),
    'actions':fields.Nested(image_actions,description='Image actions'),

})


configuration = api.model('Configuration',{
    'tools':fields.Nested(tool_configuration,description='tool config'),
    'annos':fields.Nested(anno_configuration,description='anno config'),
    'img':fields.Nested(image_configuration,description='image config'),

})


anno_task = api.model('Anno Task',{
    'id': fields.Integer(readOnly=True, description='The identifier of the anno task',attribute='id'),
    'name': fields.String(description='The name of the anno task'),
    'pipelineName': fields.String(description='The name of the anno task',attribute='pipeline_name'),
    'pipelineCreator': fields.String(description='The name of the anno task',attribute='pipeline_creator'),
    'group': fields.String(description='The group of the anno task'),
    'instructions': fields.String(description='The instructions of the anno task'),
    'createdAt': fields.DateTime(description='The creation date of the anno task', attribute='created_at'),
    'lastActivity': fields.DateTime(description='The last activity of the anno task',attribute='last_activity'),
    'lastAnnotator': fields.String(description='The last annotator of the anno task',attribute='last_annotator'),
    'type': fields.String(description='The type of the anno task'),
    'finished': fields.Integer(description='The finished status of the anno task'),
    'size': fields.Integer(description='The size of the anno task'),
    'status': fields.String(description='The status of the anno task'),
    'statistic': fields.Nested(statistics, description='The statistics of the anno task')  ,
    'userName': fields.String(description='The name of the user working on the anno task',attribute='user_name'),
    'progress': fields.Float(description='The progress of the anno task'),
    'imgCount': fields.Integer(description='The image count of the anno task',attribute='img_count'),
    'annotatedImgCount': fields.Integer(description='The count of annotated images of the anno task',attribute='annotated_img_count'),
    'labelLeaves': fields.Nested(label_leaf,description='The Root Label Leafs of the anno task',attribute='label_leaves'),
    'configuration': fields.Nested(configuration,description='The configuration of the anno task'),

    
})


anno_task_list = api.model('Anno Task List',{
    'annoTasks':fields.List(fields.Nested(anno_task),attribute='anno_tasks')
})

storage_settings = api.model('Storage Settings',{
    'datasetId': fields.Integer(readOnly=True, description='The dataset ID of the anno task',attribute='dataset_id'),
     
})