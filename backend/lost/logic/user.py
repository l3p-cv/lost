from lost.db import model

def add_user(data_man, user):
    '''add user to user meta

    Args:
        db_man (obj): Project database manager.
        user (obj): User object
    '''
    user = model.User(idx=user.id, user_name=user.username,
                       first_name=user.first_name, last_name=user.last_name,
                       email=user.email)
    data_man.save_obj(user)

def add_superuser(data_man, user):
    '''add superuser to user meta

    Args:
        db_man (obj): Project database manager.
        user (obj): User object
    '''
    user = model.User(idx=user.id)
    data_man.save_obj(user)

def update_user(data_man, user):
    '''update existing user in user meta

    Args:
        db_man (obj): Project database manager.
        user (obj): User object
    '''
    usermeta = data_man.get_user_meta(user_id=user.id)
    usermeta.first_name = user.first_name
    usermeta.last_name = user.last_name
    usermeta.user_name = user.username
    usermeta.email = user.email

    data_man.save_obj(usermeta)
