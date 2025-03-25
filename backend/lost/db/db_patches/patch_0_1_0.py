import traceback
from sqlalchemy import text
from lost.db import access
from lostconfig import LOSTConfig

def create_version_table(dbm):
    try:
        sql = """
                ALTER TABLE pipe
                ADD COLUMN changed_by_element INTEGER DEFAULT 1,
                ADD COLUMN changed_by_engine INTEGER DEFAULT 0;
            """
        dbm.session.execute(text(sql))
        print(f'executed successfull: {sql}')
    except:
        print(traceback.format_exc())

def run_all(dbm):
    print('--- Start lost db patch 0.1.0 ---')
    create_version_table(dbm)
    print('--- lost db patch 0.1.0 complete ---')

if __name__ == "__main__":
    dbm = access.DBMan(LOSTConfig())
    run_all(dbm)
    dbm.close_session()
