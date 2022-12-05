   
Migration Guide from 0.0.6 to 1.1.0
===================================
1. Make these changes to the database:

.. figure:: images/db-changes.*

    |fig-db-changes|: The the changes required to be made manually
    
2. Also you need to change your custom pipeline configuration files:
backend/lost/pyapi/examples/pipes/<your_pipeline>/<config_file>.json

3. Old unfinished tasks can become unfinishable so I recommend creating special user called 'trash' and for all unfinished tasks change lost.anno_task#group_id to 'trash' user group id from lost.user_groups.

4. I recommend clearing lost.choosen_anno_task table.


Utf-8 char encoding fix
=======================

1. Convert database to utf-8:
https://www.a2hosting.com/kb/developer-corner/mysql/convert-mysql-database-utf-8

Or run on lost database
    .. code-block:: bash
 
        SET foreign_key_checks = 0;
        ALTER TABLE anno_task  CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci; SET foreign_key_checks = 1;
        ALTER TABLE choosen_anno_task  CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci; SET foreign_key_checks = 1;
        ALTER TABLE data_export  CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci; SET foreign_key_checks = 1;
        ALTER TABLE datasource  CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci; SET foreign_key_checks = 1;
        ALTER TABLE `group`  CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci; SET foreign_key_checks = 1;
        ALTER TABLE image_anno  CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci; SET foreign_key_checks = 1;
        ALTER TABLE label  CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci; SET foreign_key_checks = 1;
        ALTER TABLE label_leaf  CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci; SET foreign_key_checks = 1;
        ALTER TABLE `loop`  CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci; SET foreign_key_checks = 1;
        ALTER TABLE pipe  CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci; SET foreign_key_checks = 1;
        ALTER TABLE pipe_element  CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci; SET foreign_key_checks = 1;
        ALTER TABLE pipe_template  CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci; SET foreign_key_checks = 1;
        ALTER TABLE required_label_leaf  CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci; SET foreign_key_checks = 1;
        ALTER TABLE result  CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci; SET foreign_key_checks = 1;
        ALTER TABLE result_link  CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci; SET foreign_key_checks = 1;
        ALTER TABLE role  CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci; SET foreign_key_checks = 1;
        ALTER TABLE script  CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci; SET foreign_key_checks = 1;
        ALTER TABLE track  CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci; SET foreign_key_checks = 1;
        ALTER TABLE two_d_anno  CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci; SET foreign_key_checks = 1;
        ALTER TABLE user  CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci; SET foreign_key_checks = 1;
        ALTER TABLE user_groups  CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci; SET foreign_key_checks = 1;
        ALTER TABLE user_roles  CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci; SET foreign_key_checks = 1;
        ALTER TABLE visual_output  CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci; SET foreign_key_checks = 1;
        ALTER TABLE worker  CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
        ALTER DATABASE CHARACTER SET utf8 COLLATE utf8_general_ci;
        SET foreign_key_checks = 1;
               
2. Change DB name in your .env to: 
    .. code-block:: bash

        LOST_DB_NAME=lost?charset=utf8mb4
 

.. |fig-db-changes| replace:: Figure 1