from sqlalchemy.sql.sqltypes import Text
from flask_restx import fields

from lost.api.api import api

config = api.model('LOST Configuration', {
    'autoLogoutTime': fields.Integer(description="Auto Logout time"),        
    'autoLogoutWarnTime': fields.Integer(description="Time before autologgout the warning appears"),     
    'isDevMode': fields.Boolean(description="Shows if dev mode is activated"),     
       
   
})
