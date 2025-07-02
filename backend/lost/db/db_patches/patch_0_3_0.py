import traceback
from sqlalchemy import text
from lost.db import access
from lostconfig import LOSTConfig


def create_inference_model_table(dbm):
    try:
        sql = """
                CREATE TABLE inference_model (
                idx INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                display_name VARCHAR(255) UNIQUE,
                server_url VARCHAR(2048) NOT NULL,
                task_type INT,
                last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                model_type VARCHAR(255) NOT NULL,
                description TEXT
                );
            """
        dbm.session.execute(text(sql))
        print(f"executed successfully : {sql}")
    except:
        print(traceback.format_exc())


def run_all(dbm):
    print("--- Start lost db patch 0.3.0 ---")
    create_inference_model_table(dbm)
    print("--- lost db patch 0.3.0 complete ---")


if __name__ == "__main__":
    dbm = access.DBMan(LOSTConfig())
    run_all(dbm)
    dbm.close_session()
