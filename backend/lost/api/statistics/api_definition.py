from sqlalchemy.sql.sqltypes import Text
from flask_restx import fields

from lost.api.api import api


history = api.model('Annos', {
    'week': fields.List(fields.Float, description="Weekly history"),        
    'month': fields.List(fields.Float, description="Monthly history"),        
   
})
annos = api.model('Annos', {
    'today': fields.Float(description="Annos today"),        
    'allTime': fields.Float( description="Annos all time"),        
    'avg': fields.Float( description="Average Annos per Day"),        
    'history': fields.Nested(history, description="History"),        
   
})



types = api.model('Annos', {
    'bbox': fields.Integer(description="Annos for type bbox"),        
    'polygon': fields.Integer(description="Annos for type polygon"),        
    'line': fields.Integer(description="Annos for type line"),        
    'point': fields.Integer(description="Annos for type point"),   
    'image': fields.Integer(description="Annos for type image"),   
})

per_hour = api.model('Annos', {
    'amountPerHour': fields.List(fields.Float, description="Annos per hour"),  
    'avgPerHour': fields.List(fields.Float, description="Average Annos per hour"),  
    'totalTimePerHour': fields.List(fields.Float, description="total Annotime per hour"),  
    'labels': fields.List(fields.String, description="Labels for the time"),  
})



anno_statistics = api.model('Annotation Statistics', {
    'annos': fields.Nested(annos, description="Anno Statistics"),        
    'labels': fields.Raw(description="Labels Statistic (Dict with class as key and a dict containg value(nummber annos) and color(of the Label) as keys)"),
    'types': fields.Nested(types, description="Type Statistics"),
    'annotime': fields.Nested(annos, description="Anno time Statistics"),
    'annotasks': fields.Nested(annos, description="Anno task statistics"),
    'processedImages': fields.Nested(annos, description="Statistics for annotated Images"),
    'annosPerHour': fields.Nested(per_hour, description="Annotations per hour for last 24 hours"),
})
      