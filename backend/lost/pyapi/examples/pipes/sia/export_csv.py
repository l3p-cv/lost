from lost.pyapi import script
import os

ENVS = ['lost']
ARGUMENTS = {'file_name' : { 'value':'annos.parquet',
                            'help': 'Name of the file with exported bbox annotations.'}
            }

class LostScript(script.Script):
    '''This Script creates a csv file from image annotations and adds a data_export
    to the output of this script in pipeline.
    '''
    def main(self):
        df = self.inp.to_df()
        fs = self.get_filesystem()
        
        file_path = self.get_path(self.get_arg('file_name'), context='instance')
        self.logger.info('File path: {}'.format(file_path))
        with fs.open(file_path, 'wb') as f:
            df.to_parquet(f)
        self.logger.info('Wrote file: {}'.format(fs.ls(os.path.split(file_path)[0])))
        self.outp.add_data_export(file_path=file_path, fs=fs)

if __name__ == "__main__":
    my_script = LostScript()
