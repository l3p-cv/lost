from lost.db import roles

class UserDbAccess(object):
    
    def __init__(self, dbm, user_id):
        '''User based file db access layer.
        
        This class will manage critical db access of a lost user. It will check
        if a user is permitted to access a specific db element.
        
        Args:
            dbm (DBMan): Lost DatabaseManager
            user_id (int): Id of the user who needs db access
        '''
        self.dbm = dbm
        self.uid = user_id 

    def get_alien(self, pe_id):
        pe = self.dbm.get_pipe_element(pe_id)
        user = self.dbm.get_user(self.uid)
        if user.has_role(roles.ADMINISTRATOR):
            return pe
        else:
            if self.uid != pe.pipe.manager_id:
                raise NotAllowedToAccessPipeElement()
            else:
                return pe


class NotAllowedToAccessPipeElement(Exception):
    '''Raises if a user is not allowed to access a specific pipe element'''

    def __str__(self):
        return 'User is not allowed to access pipe element!'