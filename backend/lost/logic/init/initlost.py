import datetime
import os
from os.path import join
from lost.db import access
from lost.logic import config
from lost.logic import file_man
from lost.db import roles
from lost.db.model import User, UserRoles, Role, Group

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
        user.roles.append(Role(name=roles.DESIGNER))
        user.roles.append(Role(name=roles.ANNOTATER))
        user.groups.append(Group(name=user.user_name, is_user_default=True))
        dbm.save_obj(user)
        dbm.close_session()



if __name__ == '__main__':
    main()
