from lost.pyapi import script
import os

ENVS = ['lost']
ARGUMENTS = {'file_name_parquet' : { 'value':'annos.parquet',
                            'help': 'Name of the file with exported bbox annotations in parquet format.'},
            'file_name_csv' : { 'value':'annos.csv',
                            'help': 'Name of the file with exported bbox annotations in csv format.'},
            }

class LostScript(script.Script):
    '''This Script creates a csv file from image annotations and adds a data_export
    to the output of this script in pipeline.
    '''
    def main(self):
        df = self.inp.to_df()
        fs = self.get_fs()
        
        file_path_parquet = self.get_path(self.get_arg('file_name_parquet'), context='instance')
        file_path_csv = self.get_path(self.get_arg('file_name_csv'), context='instance')
        self.logger.info('File path parquet: {}'.format(file_path_parquet))
        self.logger.info('File path csv: {}'.format(file_path_csv))
        
        with fs.open(file_path_parquet, 'wb') as f:
            df.to_parquet(f)
        
        with fs.open(file_path_csv, 'wb') as f:
            df.to_csv(f,sep=',',
                      header=True,
                      index=False)
        
        self.logger.info('Wrote file: {}'.format(fs.ls(os.path.split(file_path_parquet)[0])))
        self.outp.add_data_export(file_path=file_path_parquet, fs=fs)
    
        self.logger.info('Wrote file: {}'.format(fs.ls(os.path.split(file_path_csv)[0])))
        self.outp.add_data_export(file_path=file_path_csv, fs=fs)

if __name__ == "__main__":
    my_script = LostScript()
