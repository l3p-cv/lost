from lost.pyapi import script
import os
import pandas as pd

ENVS = ['lost']
ARGUMENTS = {'file_name' : { 'value':'annos.csv',
                            'help': 'Name of the file with exported bbox annotations.'}
            }

class ExportCsv(script.Script):
    '''This Script creates a csv file from image annotations and adds a data_export
    to the output of this script in pipeline.
    '''
    def main(self):
        df = self.inp.to_df()
        fs = self.get_filesystem()
        
        csv_path = self.get_path(self.get_arg('file_name'), context='instance')
        self.logger.info('CSV path: {}'.format(csv_path))
        with fs.open(csv_path, 'w') as f:
            df.to_csv(f,
                      sep=',',
                      header=True,
                      index=False)
        self.logger.info('Wrote csv file: {}'.format(fs.ls(os.path.split(csv_path)[0])))
        self.outp.add_data_export(file_path=csv_path, fs=fs)

if __name__ == "__main__":
    my_script = ExportCsv()
