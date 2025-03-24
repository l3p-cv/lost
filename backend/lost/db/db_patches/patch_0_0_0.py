import traceback
from sqlalchemy import text
from lost.db import access
from lostconfig import LOSTConfig

def create_version_table(dbm):
    try:
        sql = """
            CREATE TABLE version (
                idx INT PRIMARY KEY AUTO_INCREMENT,
                package TEXT,
                version TEXT
            );
        """
        dbm.session.execute(text(sql))
        print(f'executed successfull: {sql}')
    except:
        print(traceback.format_exc())

def run_all(dbm):
    print('--- Start daisy-backend db patch 0.0.0 ---')
    create_version_table(dbm)
    print('--- daisy-backend db patch 0.0.0 complete ---')

if __name__ == "__main__":
    dbm = access.DBMan(LOSTConfig())
    run_all(dbm)
    dbm.close_session()
