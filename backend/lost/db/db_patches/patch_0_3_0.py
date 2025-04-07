import traceback
from sqlalchemy import text
from lost.db import access
from lostconfig import LOSTConfig

def create_instruction_table(dbm):
    try:
        sql = """
            CREATE TABLE instruction (
                id INT AUTO_INCREMENT PRIMARY KEY,
                option VARCHAR(255) NOT NULL,
                description TEXT,
                instruction TEXT NOT NULL,
                is_deleted TINYINT(1) DEFAULT '0',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                parent_instruction_id INT(11) DEFAULT NULL,
                group_id INT(11) DEFAULT NULL,
                FOREIGN KEY (parent_instruction_id) REFERENCES instruction(id) ON DELETE CASCADE,
                FOREIGN KEY (group_id) REFERENCES `group`(idx) ON DELETE SET NULL
            );
        """
        dbm.session.execute(text(sql))
        print(f'executed successfully: {sql}')
    except:
        print(traceback.format_exc())

def modify_anno_task_table(dbm):
    try:
        sql = """
            ALTER TABLE anno_task
            ADD COLUMN instruction_id INT(11) DEFAULT NULL,
            DROP COLUMN instructions,
            ADD CONSTRAINT fk_anno_task_instruction_id_instruction FOREIGN KEY (instruction_id) REFERENCES instruction(id);
        """
        dbm.session.execute(text(sql))
        print(f'executed successfully: {sql}')
    except:
        print(traceback.format_exc())

def run_all(dbm):
    print('--- Start lost db patch 0.3.0 ---')
    create_instruction_table(dbm)
    modify_anno_task_table(dbm)
    print('--- lost db patch 0.3.0 complete ---')

if __name__ == "__main__":
    dbm = access.DBMan(LOSTConfig())
    run_all(dbm)
    dbm.close_session()