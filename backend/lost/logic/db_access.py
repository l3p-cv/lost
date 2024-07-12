from lost.db import roles
from lost.db import model

class UserDbAccess(object):
    
    def __init__(self, dbm, user):
        '''User based file db access layer.
        
        This class will manage critical db access of a lost user. It will check
        if a user is permitted to access a specific db element.
        
        Args:
            dbm (DBMan): Lost DatabaseManager
            user_id (int or model.User): Id of the user who needs db access
        '''
        self.dbm = dbm
        if isinstance(user, model.User):
            self.user = user
            self.uid = user.idx
        else:
            self.user = self.dbm.get_user(user)
            self.uid = user

    def get_alien(self, pe_id):
        pe = self.dbm.get_pipe_element(pe_id)
        user = self.user
        if user.has_role(roles.ADMINISTRATOR):
            return pe
        else:
            if self.uid != pe.pipe.manager_id:
                raise NotAllowedToAccessPipeElement()
            else:
                return pe
    
    def may_access_pe(self, pe_id):
        '''Check if user may access a specific pipeline element'''
        user = self.user
        if user.has_role(roles.ADMINISTRATOR):
            return True
        else:
            if isinstance(pe_id, model.PipeElement):
                pe = pe_id
            else:
                pe = self.dbm.get_pipe_element(pe_id)
            if self.uid != pe.pipe.manager_id:
                raise NotAllowedToAccessPipeElement()
            else:
                return True
            


class NotAllowedToAccessPipeElement(Exception):
    '''Raises if a user is not allowed to access a specific pipe element'''

    def __str__(self):
        return 'User is not allowed to access pipe element!'