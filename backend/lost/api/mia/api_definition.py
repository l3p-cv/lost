from flask_restplus import fields

from lost.api.api import api


mia_anno = api.model('MIA Annotation', {
    'image': fields.Raw(),
    'drawables': fields.Raw(),
})
