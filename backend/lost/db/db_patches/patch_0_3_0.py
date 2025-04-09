import traceback
from sqlalchemy import text
from lost.db import access
from lostconfig import LOSTConfig

def create_instruction_table(dbm):
    """Create the 'instruction' table if it doesn't exist."""
    try:
        sql = """
            CREATE TABLE IF NOT EXISTS instruction (
                id INT AUTO_INCREMENT PRIMARY KEY,
                `option` VARCHAR(255) NOT NULL,
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
        print("✅ Created 'instruction' table successfully.")
    except:
        print("❌ Error creating 'instruction' table:\n" + traceback.format_exc())

def add_instruction_id_column_if_not_exists(dbm):
    """Add 'instruction_id' column to 'anno_task' if it doesn't exist."""
    try:
        check_sql = """
            SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
            WHERE table_name = 'anno_task' AND column_name = 'instruction_id';
        """
        result = dbm.session.execute(text(check_sql)).fetchone()
        if result[0] == 0:
            dbm.session.execute(text("""
                ALTER TABLE anno_task
                ADD COLUMN instruction_id INT(11) DEFAULT NULL;
            """))
            print("✅ Added 'instruction_id' column to 'anno_task'.")
        else:
            print("ℹ️ Column 'instruction_id' already exists. Skipping.")
    except:
        print("❌ Error adding 'instruction_id' column:\n" + traceback.format_exc())

def drop_instruction_column_if_exists(dbm):
    """Drop 'instructions' column from 'anno_task' if it exists."""
    try:
        check_sql = """
            SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
            WHERE table_name = 'anno_task' AND column_name = 'instructions';
        """
        result = dbm.session.execute(text(check_sql)).fetchone()
        if result[0] > 0:
            dbm.session.execute(text("ALTER TABLE anno_task DROP COLUMN instructions;"))
            print("✅ Dropped 'instructions' column from 'anno_task'.")
        else:
            print("ℹ️ Column 'instructions' does not exist. Skipping.")
    except:
        print("❌ Error dropping 'instructions' column:\n" + traceback.format_exc())


def add_instruction_foreign_key(dbm):
    """Add FK constraint to 'anno_task.instruction_id' -> 'instruction.id'."""
    try:
        dbm.session.execute(text(f"""
            ALTER TABLE anno_task
            ADD CONSTRAINT fk_anno_task_instruction_id_instruction_2
            FOREIGN KEY (instruction_id) REFERENCES instruction(id);
        """))
        print(f"✅ Added FK on 'instruction_id' with name 'fk_anno_task_instruction_id_instruction_2'.")
    except:
        print("❌ Error adding FK:\n" + traceback.format_exc())

def run_all(dbm):
    print("\n--- Start LOST DB Patch 0.3.0 ---")
    create_instruction_table(dbm)
    add_instruction_id_column_if_not_exists(dbm)
    add_instruction_foreign_key(dbm)
    drop_instruction_column_if_exists(dbm)
    print("--- LOST DB Patch 0.3.0 Complete ---\n")

if __name__ == "__main__":
    dbm = access.DBMan(LOSTConfig())
    run_all(dbm)
    dbm.close_session()
