from cryptography.fernet import Fernet
from lostconfig import LOSTConfig

class Crypt(object):
    
    def __init__(self):
        self.chipper = Fernet(LOSTConfig().secret_key.encode())
    
    def encrypt(self, text):
        return self.chipper.encrypt(text.encode()).decode()
    
    def decrypt(self, text):
        return self.chipper.decrypt(text.encode()).decode()    