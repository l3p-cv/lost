from lost.pyapi import script
import os
import pandas as pd

ENVS = ['lost']
ARGUMENTS = {'pe_id' : { 'value':'[int] pipeline element id of the script after a anno task',
                            'help': 'Pipeline element id of the script to emulate'},
            'file_name' : { 'value':'annos.csv',
                            'help': 'Name of the file with exported bbox annotations.'}
            }

class EmulateScript(script.Script):
    '''This script emulates a script from a running pipeline and exports all annotations.
    '''
    def main(self):
        e_script = script.Script(int(self.get_arg('pe_id')))
        df = e_script.inp.to_df()
        csv_path = self.get_path(self.get_arg('file_name'), context='instance')
        df.to_csv(path_or_buf=csv_path,
                      sep=',',
                      header=True,
                      index=False)
        self.outp.add_data_export(file_path=csv_path)
        self.logger.info('Stored export to: {}'.format(csv_path))
        
if __name__ == "__main__":
    my_script = EmulateScript()
