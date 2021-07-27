from lost.pyapi import script
import os
import pandas as pd

ENVS = ['lost']
ARGUMENTS = {'file_name' : { 'value':'annos.csv',
                            'help': 'Name of the file with exported bbox annotations.'}
            }

class LostScript(script.Script):
    '''This Script creates a csv file from image annotations and adds a data_export
    to the output of this script in pipeline.
    '''
    def main(self):
        df = self.inp.to_df()
        csv_path = self.get_path(self.get_arg('file_name'), context='instance')
        df.to_csv(path_or_buf=csv_path,
                      sep=',',
                      header=True,
                      index=False)
        self.outp.add_data_export(file_path=csv_path)

if __name__ == "__main__":
    my_script = LostScript()
