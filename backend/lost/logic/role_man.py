from lost.settings import LOST_CONFIG
from lost.db import access

DESIGNER = 'Designer'
ANNOTATER = 'Annotater'

def has_role(user, role):
    dbm = access.DBMan(LOST_CONFIG)
    roles = []
    for r in dbm.get_user_roles(user_id=user.idx):
        roles.append(dbm.get_role(role_id=r.idx).name)
    dbm.close_session()
    if role in roles:
        return True
    else:
        return False
