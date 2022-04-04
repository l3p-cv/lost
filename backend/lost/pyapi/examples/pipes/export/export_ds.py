from lost.pyapi import script
import lost_ds as lds
import os

ENVS = ['lost']
ARGUMENTS = {'ds_name' : { 'value':'my_lost_ds',
                            'help': 'Name of the packed ds'},
             'pe_id' : { 'value':'-',
                            'help': 'Select the pipeline element that should be exported'}
            }

class LostScript(script.Script):
    '''This Script creates a packed ds
    '''
    def main(self):
        alien = self.get_alien_element(self.get_arg('pe_id'))
        df = alien.outp.to_df()
        fs = self.get_filesystem()
        ds = lds.LOSTDataset(df, fs)
        root_path = self.get_path(self.get_arg('ds_name'), context='instance')
        p_path = os.path.join(os.path.join(root_path, 'ds.parquet'))
        csv_path = os.path.join(os.path.join(root_path, 'ds.csv'))

        ds.df['img_path'] = ds.df['abs_path']
        df = ds.pack_ds(root_path)
        df['img_path'] = df['img_path'].apply(lambda x: os.path.join(*x.split('/')[-2:]))

        self.logger.info('File path parquet: {}'.format(p_path))
        self.logger.info('File path csv: {}'.format(csv_path))

        lds.LOSTDataset(df, fs).to_parquet(p_path)
        
        # with fs.open(p_path, 'wb') as f:
        #     df.to_parquet(f)
        
        with fs.open(csv_path, 'wb') as f:
            df.to_csv(f,sep=',',
                      header=True,
                      index=False)
        
        # self.logger.info('Wrote file: {}'.format(fs.ls(os.path.split(file_path_parquet)[0])))
        # self.outp.add_data_export(file_path=file_path_parquet, fs=fs)
    
        # self.logger.info('Wrote file: {}'.format(fs.ls(os.path.split(file_path_csv)[0])))
        # self.outp.add_data_export(file_path=file_path_csv, fs=fs)

if __name__ == "__main__":
    my_script = LostScript()
