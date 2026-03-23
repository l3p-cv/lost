import traceback

from sqlalchemy import text

from lost.db import access
from lostconfig import LOSTConfig


def add_navigation_columns_to_image_annos_if_not_existing(dbm):
    """Add 'chunk_id' and 'update_id' columns to 'image_anno' if they don't exist."""
    columns_to_add = {
        "chunk_id": "INT DEFAULT -1",
        "update_id": "INT DEFAULT -1"
    }
    
    try:
        for column_name, definition in columns_to_add.items():
            # Check if this specific column exists
            check_sql = text("""
                SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
                WHERE table_name = 'image_anno' AND column_name = :col;
            """)
            
            result = dbm.session.execute(check_sql, {"col": column_name}).fetchone()
            
            if result[0] == 0:
                # Add the column individually
                dbm.session.execute(text(f"ALTER TABLE image_anno ADD COLUMN {column_name} {definition};"))
                dbm.session.commit() # Commit after each change
                print(f"✅ Added '{column_name}' column to 'image_anno'.")
            else:
                print(f"ℹ️ Column '{column_name}' already exists. Skipping.")
                
    except Exception:
        dbm.session.rollback()
        print("❌ Error updating 'image_anno' table:\n" + traceback.format_exc())



def add_navigation_columns_to_two_d_annos_if_not_existing(dbm):
    """Add 'chunk_id' and 'update_id' columns to 'two_d_anno' if they don't exist."""
    columns_to_add = {
        "chunk_id": "INT DEFAULT -1",
        "update_id": "INT DEFAULT -1"
    }
    
    try:
        for column_name, definition in columns_to_add.items():
            # Check if this specific column exists
            check_sql = text("""
                SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
                WHERE table_name = 'two_d_anno' AND column_name = :col;
            """)
            
            result = dbm.session.execute(check_sql, {"col": column_name}).fetchone()
            
            if result[0] == 0:
                # Add the column individually
                dbm.session.execute(text(f"ALTER TABLE two_d_anno ADD COLUMN {column_name} {definition};"))
                dbm.session.commit() # Commit after each change
                print(f"✅ Added '{column_name}' column to 'two_d_anno'.")
            else:
                print(f"ℹ️ Column '{column_name}' already exists. Skipping.")
                
    except Exception:
        dbm.session.rollback()
        print("❌ Error updating 'two_d_anno' table:\n" + traceback.format_exc())



def run_all(dbm):
    print("\n--- Start LOST DB Patch 0.5.0 ---")
    add_navigation_columns_to_image_annos_if_not_existing(dbm)
    add_navigation_columns_to_two_d_annos_if_not_existing(dbm)
    print("--- LOST DB Patch 0.5.0 Complete ---\n")


if __name__ == "__main__":
    dbm = access.DBMan(LOSTConfig())
    run_all(dbm)
    dbm.close_session()
