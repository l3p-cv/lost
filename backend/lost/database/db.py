import datetime
from flask_sqlalchemy import SQLAlchemy
#from lost.database.models import User, UserRoles, user_manager, Role

db = SQLAlchemy()

def create_all():
    db.create_all()

def reset():
    db.drop_all()
    db.create_all()