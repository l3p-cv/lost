from flask_restplus import fields

from lost.api.api import api

image = api.model('Image', {
    'id': fields.Integer(readOnly=True, description='The identifier of the image.'),
    'url': fields.String(readOnly=True, description='The url of the image.'),
    'number': fields.Integer(readOnly=True, description='Number of the current image in that annotation task.'),
    'amount': fields.Integer(readOnly=True, description='Number of total images in that annotation task.'),
    'isFirst': fields.Boolean(readOnly=True, description='Weather the image is the first one of the annotation process.'),
    'isLast': fields.Boolean(readOnly=True, description='Weather the image is the last one of the annotation process.'),
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
    'data': fields.Nested(bbox_data, description='2-D data of that box.')
})


point_data = api.model('Point Data',{
    'x': fields.Float(readOnly=True, description='Relative and centered value of x.'),
    'y': fields.Float(readOnly=True, description='Relative and centered value of y.')
})


point = api.model('Point',{
    'id': fields.Integer(readOnly=True, description='The identifier of the point.'),
    'labelIds': fields.List(fields.Integer(readOnly=True, description='Label id.'), description='All label ids which belongs to that point.'),
    'data': fields.Nested(point_data, description='2-D data of that point.')
})


line = api.model('Line',{
    'id': fields.Integer(readOnly=True, description='The identifier of the line.'),
    'labelIds': fields.List(fields.Integer(readOnly=True, description='Label id.'), description='All label ids which belongs to that line.'),
    'data': fields.List(fields.Nested(point_data, description='2-D data of that line.'))
})


polygon = api.model('Polygon',{
    'id': fields.Integer(readOnly=True, description='The identifier of the polygon.'),
    'labelIds': fields.List(fields.Integer(readOnly=True, description='Label id.'), description='All label ids which belongs to that polygon.'),
    'data': fields.List(fields.Nested(point_data, description='2-D data of that polygon.'))
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
    'bbox': fields.Boolean(readOnly=True, description='Weather to work with bboxes.')
})

sia_config_actions_edit = api.model('SIA Config Actions edit',{
    'label': fields.Boolean(readOnly=True, description="Weather to allow to edit the label."),
    'bounds': fields.Boolean(readOnly=True, description="Weather to allow to edit the bounds."),
    'delete': fields.Boolean(readOnly=True, description="Weather to allow to delete.")
})
sia_config_actions = api.model('SIA Config Actions', {
    'drawing': fields.Boolean(readOnly=True, description='Weather to work with points.'),
    'labeling': fields.Boolean(readOnly=True, description='Weather to work with lines.'),
    'edit': fields.Nested(sia_config_actions_edit)
})

sia_config_annotations_bbox = api.model('SIA Config BBox annotations.',{
    'minArea': fields.Float(readOnly=True, description='Minimal area of a bbox.'),
    'minAreaType': fields.String(readOnly=True, description='Can be "rel" (relative) and "abs" (absolut)')
})

sia_config_annotations = api.model('SIA Config annotations', {
    'bbox': fields.Nested(sia_config_annotations_bbox)
})

sia_config = api.model('SIA Configuration', {
    'tools': fields.Nested(sia_config_tools,description='Tools to work with in SIA.'),
    'actions': fields.Nested(sia_config_actions, description="Actions which are allowed."),
    'annotations': fields.Nested(sia_config_annotations, description="Configuration options of certain annotations.")
})

sia_update_bbox = api.model('SIA update bbox', {
    'id': fields.Integer(description='The identifier of the bbox'),
    'labelIds': fields.List(fields.Integer(required=True, description='Label id.'), description='All label ids which belongs to that bbox.'),
    'status': fields.String(required=True, description='Status of that bbox can be "new", "changed" and "deleted".'),
    'data': fields.Nested(bbox_data)
})

sia_update_point = api.model('SIA update point', {
    'id': fields.Integer(description='The identifier of the point'),
    'labelIds': fields.List(fields.Integer(required=True, description='Label id.'), description='All label ids which belongs to that point.'),
    'status': fields.String(required=True, description='Status of that point can be "new", "changed" and "deleted".'),
    'data': fields.Nested(point_data,required=True,)
})

sia_update_line = api.model('SIA update line', {
    'id': fields.Integer(description='The identifier of the line'),
    'labelIds': fields.List(fields.Integer(required=True, description='Label id.'), description='All label ids which belongs to that line.'),
    'status': fields.String(required=True, description='Status of that line can be "new", "changed" and "deleted".'),
    'data': fields.List(fields.Nested(point_data),required=True,)
})

sia_update_polygon = api.model('SIA update polygon', {
    'id': fields.Integer(description='The identifier of the polygon'),
    'labelIds': fields.List(fields.Integer(required=True, description='Label id.'), description='All label ids which belongs to that polygon.'),
    'status': fields.String(required=True, description='Status of that polygon can be "new", "changed" and "deleted".'),
    'data': fields.List(fields.Nested(point_data),required=True)
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
})