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
    'labelIds': fields.List(fields.Integer(readOnly=True, description='Label id.'), description='All label ids which belongs to that bbox.'),
    'data': fields.Nested(point_data, description='2-D data of that point.')
})


line_data = api.model('Line Data',{
    'x': fields.Float(readOnly=True, description='Relative and centered value of x.'),
    'y': fields.Float(readOnly=True, description='Relative and centered value of y.')
})


line = api.model('Line',{
    'id': fields.Integer(readOnly=True, description='The identifier of the line.'),
    'labelIds': fields.List(fields.Integer(readOnly=True, description='Label id.'), description='All label ids which belongs to that bbox.'),
    'data': fields.List(fields.Nested(line_data, description='2-D data of that line.'))
})

polygon_data = api.model('Polygon Data',{
    'x': fields.Float(readOnly=True, description='Relative and centered value of x.'),
    'y': fields.Float(readOnly=True, description='Relative and centered value of y.')
})

polygon = api.model('Polygon',{
    'id': fields.Integer(readOnly=True, description='The identifier of the polygon.'),
    'labelIds': fields.List(fields.Integer(readOnly=True, description='Label id.'), description='All label ids which belongs to that bbox.'),
    'data': fields.List(fields.Nested(bbox_data, description='2-D data of that polygon.'))
})

drawables = api.model('Drawables',{
    'bBoxes': fields.List(fields.Nested(bbox)),
    'points': fields.List(fields.Nested(point)),
    'lines': fields.List(fields.Nested(line)),
    'polygons': fields.List(fields.Nested(polygon)),

})

sia_anno = api.model('SIA Annotation', {
    'image': fields.Nested(image),
    'drawables': fields.List(fields.Nested(drawables)),
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

sia_config_drawables_bbox = api.model('SIA Config BBox drawables.',{
    'minArea': fields.Float(readOnly=True, description='Minimal area of a bbox.'),
    'minAreaType': fields.String(readOnly=True, description='Can be "rel" (relative) and "abs" (absolut)')
})

sia_config_drawables = api.model('SIA Config Drawables', {
    'bbox': fields.Nested(sia_config_drawables_bbox)
})

sia_config = api.model('SIA Configuration', {
    'tools': fields.Nested(sia_config_tools,description='Tools to work with in SIA.'),
    'actions': fields.Nested(sia_config_actions, description="Actions which are allowed."),
    'drawables': fields.Nested(sia_config_drawables, description="Configuration options of certain Drawables.")
})