import MySQLdb
from lostconfig import LOSTConfig
import time

class DBPatcher():
    
    def __init__(self):
        pass
    
    def patch(self):
        try:
            self.__patch_user_api_token()
            time.sleep(3)
        except:
            print("Could not patch Database.")
    
    def __patch_user_api_token(self):
        lost_config = LOSTConfig()
        db = MySQLdb.connect(host=lost_config.lost_db_ip,
                            port=int(lost_config.lost_db_port),
                            user=lost_config.lost_db_user,
                            passwd=lost_config.lost_db_pwd,
                            db=lost_config.lost_db_name)

        cur = db.cursor()
        cur.execute("ALTER TABLE user ADD COLUMN api_token varchar(4096)")
        db.close()
