from cryptography.fernet import Fernet
from lostconfig import LOSTConfig
import json

class Crypt(object):
    
    def __init__(self):
        self.chipper = Fernet(LOSTConfig().secret_key.encode())
    
    def encrypt(self, text):
        return self.chipper.encrypt(text.encode()).decode()
    
    def decrypt(self, text):
        return self.chipper.decrypt(text.encode()).decode()    

def encrypt_fs_connection(con):
    c = Crypt()
    try:
        return c.encrypt(con)
    except:
        return c.encrypt(json.dumps(con))

def decrypt_fs_connection(fs_db):
    if fs_db.fs_type == 'file':
        return fs_db.connection
    c = Crypt()
    dec = c.decrypt(fs_db.connection)
    try:
        return json.loads(dec)
    except:
        return dec