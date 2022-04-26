from lost.db.access import DBMan
from lost.db import roles

class UserPermissions(object):
    
    def __init__(self, dbm, user):
        self.dbm = dbm
        self.user = user

    def is_users_default_group(self, group_id):
        for user_group in self.user.groups:
            if user_group.group.is_user_default:
                if group_id == user_group.group.idx:
                    return True
        return False

    def allowed_to_mark_example(self):
        '''Check if a user is allowed to mark an annotation as example

        Note:
            A user is allowed if he is owner of the associated LabelTree.
        
        Returns:
            bool: True if a user is allowed
        '''
        if self.user.has_role(roles.ADMINISTRATOR): 
            return True
        else:
            anno_task = self.user.choosen_anno_tasks[0].anno_task
            for rll in anno_task.req_label_leaves:
                if self.is_users_default_group(rll.label_leaf.group_id):
                    return True
            return False
     