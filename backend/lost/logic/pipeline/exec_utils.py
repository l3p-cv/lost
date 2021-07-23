import os
import importlib
import zipfile
    
def zipdir(path, out_path):
    # zipf is zipfile handle
    zipf = zipfile.ZipFile(out_path, 'w', zipfile.ZIP_DEFLATED)
    for root, dirs, files in os.walk(path):
        for file in files:
            zipf.write(os.path.join(root, file), 
                       os.path.relpath(os.path.join(root, file), 
                                       os.path.join(path, '..')))
    zipf.close()

def import_by_string(full_name):
    module_name, unit_name = full_name.rsplit('.', 1)
    mod = importlib.import_module(module_name)
    return getattr(mod, unit_name)

def exec_dyn_class(idx, class_name):
    my_class = import_by_string(class_name)
    instance = my_class(idx)
    instance._run()

def get_import_name_by_script(scr):
    mod_name = os.path.splitext(scr.name)[0]
    return f'{mod_name}.LostScript'
