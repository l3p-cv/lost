import importlib
import os
import sys
import argparse

def main(args):
    #try to import script before execution to catch import errors, 
    #inconsistent use of tabs, etc. 
    script_path = args.script_path
    sys.path.append(os.path.split(script_path)[0])
    custom_script = importlib.machinery.SourceFileLoader(os.path.basename(script_path).replace('.py',''),
                                        script_path).load_module()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Import a python script and check if there are errors')
    parser.add_argument('script_path', help='Path to detection file')
    args = parser.parse_args()
    main(args)