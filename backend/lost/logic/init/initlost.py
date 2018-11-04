import datetime
import os
from os.path import join
from lost.db import access
from lost.logic import config
from lost.logic import file_man
from lost.db.model import User, UserRoles, Role
from lost.logic import role_man

def main():
    lostconfig = config.LOSTConfig()
    project_root = join(os.environ['LOST_HOME'], "data")
    if not os.path.exists(project_root):
        os.makedirs(project_root)
    fman = file_man.FileMan(lostconfig)
    fman.create_project_folders()
    # Create Tables
    dbm = access.DBMan(lostconfig)
    dbm.create_database()
    create_first_user(dbm)

def create_first_user(dbm):
    if not dbm.find_user_by_email('admin@example.com'):
        user = User(
            user_name = 'admin',
            email='admin@example.com',
            email_confirmed_at=datetime.datetime.utcnow(),
            password='admin',
            first_name= 'LOST',
            last_name='Admin'
        )
        user.roles.append(Role(name=role_man.DESIGNER))
        user.roles.append(Role(name=role_man.ANNOTATER))
        dbm.save_obj(user)
        dbm.close_session()

if __name__ == '__main__':
    main()
