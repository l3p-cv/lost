from sqlalchemy.sql.sqltypes import Text
from flask_restx import fields

from lost.api.api import api

image = api.model('Image', {
    'id': fields.Integer(readOnly=True, description='The identifier of the image.'),
    # 'url': fields.String(readOnly=True, description='The url of the image.'),
    'number': fields.Integer(readOnly=True, description='Number of the current image in that annotation task.'),
    'amount': fields.Integer(readOnly=True, description='Number of total images in that annotation task.'),
    'isFirst': fields.Boolean(readOnly=True, description='Weather the image is the first one of the annotation process.'),
    'isLast': fields.Boolean(readOnly=True, description='Weather the image is the last one of the annotation process.'),
    'isLast': fields.Boolean(readOnly=True, description='Weather the image is the last one of the annotation process.'),
    'labelIds': fields.List(fields.Integer(readOnly=True, description='Label id.'), description='All label ids which belongs to this image.'),
    'isJunk': fields.Boolean(readOnly=True, description='Indicates if the image was marked as Junk.'),
    'annoTime': fields.Float(readOnly=True, description='Annotation time in seconds'),
    'description': fields.String(readOnly=True, description='Description comment for this image'),
    'imgActions': fields.List(fields.String(readOnly=True, description='imgAction'), description='Image actions that have been performed by user')
})

bbox_data = api.model('BBox Data',{
    'x': fields.Float(readOnly=True, description='Relative and centered value of x.'),
    'y': fields.Float(readOnly=True, description='Relative and centered value of y.'),
    'w': fields.Float(readOnly=True, description='Relative value of box width.'),
    'h': fields.Float(readOnly=True, description='Relative value of box height.')
})

bbox = api.model('BBox',{
    'id': fields.Integer(readOnly=True, description='The identifier of the bbox.'),
    'labelIds': fields.List(fields.Integer(readOnly=True, description='Label id.'), description='All label ids which belongs to that bbox.'),
    'data': fields.Nested(bbox_data, description='2-D data of that box.'),
    'annoTime': fields.Float(readOnly=True, description='Annotation time in seconds'),
    'isExample': fields.Boolean(description='Indicates wether annotation is an example', required=True),
    'comment': fields.String(readOnly=True, description='A comment for this 2D annoation')
})


point_data = api.model('Point Data',{
    'x': fields.Float(readOnly=True, description='Relative and centered value of x.'),
    'y': fields.Float(readOnly=True, description='Relative and centered value of y.')
})


point = api.model('Point',{
    'id': fields.Integer(readOnly=True, description='The identifier of the point.'),
    'labelIds': fields.List(fields.Integer(readOnly=True, description='Label id.'), description='All label ids which belongs to that point.'),
    'data': fields.Nested(point_data, description='2-D data of that point.'),
    'annoTime': fields.Float(readOnly=True, description='Annotation time in seconds'),
    'isExample': fields.Boolean(description='Indicates wether annotation is an example', required=True),
    'comment': fields.String(readOnly=True, description='A comment for this 2D annoation')
})


line = api.model('Line',{
    'id': fields.Integer(readOnly=True, description='The identifier of the line.'),
    'labelIds': fields.List(fields.Integer(readOnly=True, description='Label id.'), description='All label ids which belongs to that line.'),
    'data': fields.List(fields.Nested(point_data, description='2-D data of that line.')),
    'annoTime': fields.Float(readOnly=True, description='Annotation time in seconds'),
    'isExample': fields.Boolean(description='Indicates wether annotation is an example', required=True),
    'comment': fields.String(readOnly=True, description='A comment for this 2D annoation')
})


polygon = api.model('Polygon',{
    'id': fields.Integer(readOnly=True, description='The identifier of the polygon.'),
    'labelIds': fields.List(fields.Integer(readOnly=True, description='Label id.'), description='All label ids which belongs to that polygon.'),
    'data': fields.List(fields.Nested(point_data, description='2-D data of that polygon.')),
    'annoTime': fields.Float(readOnly=True, description='Annotation time in seconds'),
    'isExample': fields.Boolean(description='Indicates wether annotation is an example', required=True),
    'comment': fields.String(readOnly=True, description='A comment for this 2D annoation')
})

annotations = api.model('Annotations',{
    'bBoxes': fields.List(fields.Nested(bbox)),
    'points': fields.List(fields.Nested(point)),
    'lines': fields.List(fields.Nested(line)),
    'polygons': fields.List(fields.Nested(polygon)),

})

sia_anno = api.model('SIA Annotation', {
    'image': fields.Nested(image),
    'annotations': fields.Nested(annotations),
})

sia_config_tools = api.model('SIA Config Tools', {
    'point': fields.Boolean(readOnly=True, description='Weather to work with points.'),
    'line': fields.Boolean(readOnly=True, description='Weather to work with lines.'),
    'polygon': fields.Boolean(readOnly=True, description='Weather to work with polygons.'),
    'bbox': fields.Boolean(readOnly=True, description='Weather to work with bboxes.'),
    'junk': fields.Boolean(readOnly=True, description='Indicates wether a junk button is visible.')
})

sia_config_annos_actions = api.model('SIA Config Anno Actions', {
    'draw': fields.Boolean(readOnly=True, description='Indicates if an annotator is allowed to draw new 2d annotations.'),
    'label': fields.Boolean(readOnly=True, description='Indicates if an annotator may assign a label to a 2d annotation.'),
    'edit': fields.Boolean(readOnly=True, description='An annotator may edit a 2d annotation in size or shape.'),
})
sia_config_annos = api.model('SIA Config Annos', {
    'minArea': fields.Integer(readOnly=True, description='Minimum area that is allowed for a 2d annotation.'),
    'multilabels': fields.Boolean(readOnly=True, description='Multiple labels may be assigned per 2d annotation.'),
    'actions': fields.Nested(sia_config_annos_actions)
})

sia_config_img_actions = api.model('SIA Config Image Actions', {
    'label': fields.Boolean(readOnly=True, description='Indicates if an annotator may assign a label to the image'),
})

sia_config_img = api.model('SIA Config Annos', {
    'multilabels': fields.Boolean(readOnly=True, description='Multiple labels may be assigned for the image'),
    'actions': fields.Nested(sia_config_img_actions)
})

sia_config = api.model('SIA Configuration', {
    'tools': fields.Nested(sia_config_tools,description='Tools to work with in SIA.'),
    'annos': fields.Nested(sia_config_annos, description="Config for 2d annotations."),
    'img': fields.Nested(sia_config_img, description="Config for the image"),
})

sia_update_bbox = api.model('SIA update bbox', {
    'id': fields.Integer(description='The identifier of the bbox'),
    'labelIds': fields.List(fields.Integer(required=True, description='Label id.'), description='All label ids which belongs to that bbox.'),
    'status': fields.String(required=True, description='Status of that bbox can be "new", "changed" and "deleted".'),
    'data': fields.Nested(bbox_data),
    'isExample': fields.Boolean(description='Indicates wether annotation is an example', required=True),
    'annoTime': fields.Float(readOnly=True, description='Annotation time in seconds')
})

sia_update_point = api.model('SIA update point', {
    'id': fields.Integer(description='The identifier of the point'),
    'labelIds': fields.List(fields.Integer(required=True, description='Label id.'), description='All label ids which belongs to that point.'),
    'status': fields.String(required=True, description='Status of that point can be "new", "changed" and "deleted".'),
    'data': fields.Nested(point_data,required=True,),
    'isExample': fields.Boolean(description='Indicates wether annotation is an example', required=True),
    'annoTime': fields.Float(readOnly=True, description='Annotation time in seconds')
})

sia_update_line = api.model('SIA update line', {
    'id': fields.Integer(description='The identifier of the line'),
    'labelIds': fields.List(fields.Integer(required=True, description='Label id.'), description='All label ids which belongs to that line.'),
    'status': fields.String(required=True, description='Status of that line can be "new", "changed" and "deleted".'),
    'data': fields.List(fields.Nested(point_data),required=True,),
    'annoTime': fields.Float(readOnly=True, description='Annotation time in seconds'),
    'isExample': fields.Boolean(description='Indicates wether annotation is an example', required=True)
})

sia_update_polygon = api.model('SIA update polygon', {
    'id': fields.Integer(description='The identifier of the polygon'),
    'labelIds': fields.List(fields.Integer(required=True, description='Label id.'), description='All label ids which belongs to that polygon.'),
    'status': fields.String(required=True, description='Status of that polygon can be "new", "changed" and "deleted".'),
    'data': fields.List(fields.Nested(point_data),required=True),
    'annoTime': fields.Float(readOnly=True, description='Annotation time in seconds'),
    'isExample': fields.Boolean(description='Indicates wether annotation is an example', required=True)
})

sia_update_annotations = api.model('SIA update annotations',{
    'bBoxes': fields.List(fields.Nested(sia_update_bbox), required=True),
    'points': fields.List(fields.Nested(sia_update_point), required=True),
    'lines': fields.List(fields.Nested(sia_update_line), required=True),
    'polygons': fields.List(fields.Nested(sia_update_polygon), required=True)
})
sia_update = api.model('SIA Update',{
    'imgId': fields.Integer(required=True, description='Id of image annotation.'),
    'annotations': fields.Nested(sia_update_annotations, required=True, description='All annotations which should be updated.'),
    'imgLabelIds': fields.List(fields.Integer(description='A list of label ids for the image'), required=True),
    'imgLabelChanged': fields.Boolean(description='Indicates of the labels for the image have been changed by the annotator', required=True),
    'isJunk': fields.Boolean(description='Indicates wether the image was marked as Junk by the annotator.', required=True),
    'isAutoSave': fields.Boolean(description='Indicates wether this update is an auto save request', required=True)
})