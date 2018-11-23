'''Helper function for testing'''

from lost.db import model
from lost.logic.label import LabelTree
import datetime
import pandas as pd

def get_user(dbm):
    email = 'test@example.com'
    user = None
    for u in dbm.get_users():
        if u.email == email:
            user = u
            break
    if user is None:
        user = model.User(
                user_name = 'test',
                email=email,
                email_confirmed_at=datetime.datetime.utcnow(),
                password='test',
                first_name= 'Test',
                last_name='User'
            )
        user.groups.append(model.Group(name=user.user_name, 
                            is_user_default=True))
        dbm.add(user)
        dbm.commit()
    return user

def delete_user(dbm, user):
    for g in user.groups:
        if g.is_user_default:
            dbm.delete(g)
    dbm.delete(user)
    dbm.commit()

def get_voc_label_tree(dbm):
    tree = LabelTree(dbm)
    df = pd.read_csv('/code/backend/lost/pyapi/examples/label_trees/pascal_voc2012.csv')
    root = tree.import_df(df)
    if root is None:
        name = df[df['parent_leaf_id'].isnull()]['name'].values[0]
        tree = LabelTree(dbm, name=name)
    return tree
