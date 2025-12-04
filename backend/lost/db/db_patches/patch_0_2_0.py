import traceback

from sqlalchemy import text

from lost.db import access
from lostconfig import LOSTConfig


def create_dataset_export_table(dbm):
    try:
        sql = """
            CREATE TABLE dataset_export (
            idx INT AUTO_INCREMENT PRIMARY KEY,
            dataset_id INT NOT NULL,
            file_path VARCHAR(255) NOT NULL,
            progress INT NOT NULL DEFAULT 0,
            FOREIGN KEY (dataset_id) REFERENCES dataset(idx)
            );
            """
        dbm.session.execute(text(sql))
        print(f"executed successfully : {sql}")
    except:
        print(traceback.format_exc())


def run_all(dbm):
    print("--- Start lost db patch 0.2.0 ---")
    create_dataset_export_table(dbm)
    print("--- lost db patch 0.2.0 complete ---")


if __name__ == "__main__":
    dbm = access.DBMan(LOSTConfig())
    run_all(dbm)
    dbm.close_session()
