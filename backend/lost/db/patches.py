import lost
from lost.logic.file_man import AppFileMan
from lostconfig import LOSTConfig
import os
import json
from lost.db.db_patch import DBPatcher

def update_version_log():
    fm = AppFileMan(LOSTConfig())
    path = fm.get_version_log_path()
    try:
        if not os.path.exists(path):
            print('Patchsystem: Created version log file: {}'.format(path))
            versions = []
            versions.append(lost.__version__)
            with open(path, 'w') as json_file:
                json.dump(versions, json_file)
        else:
            with open(path) as json_file:  
                versions = json.load(json_file)
                print("Versions: ", versions)
            if versions[-1] == lost.__version__:
                print('Patchsystem: No version change!')
            else:
                print('Patchsystem: We maybe need to patch!')
                dbp = DBPatcher()
                dbp.patch()
                versions.append(lost.__version__)
                with open(path, 'w') as json_file:
                    json.dump(versions, json_file)
    except:
        print('Could not execute patch.')


