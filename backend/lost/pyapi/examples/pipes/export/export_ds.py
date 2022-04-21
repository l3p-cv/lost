from lost.pyapi import script
from zipfile import ZipFile
import lost_ds as lds
from lost_ds.util import prep_parquet
import os
from io import BytesIO

ENVS = ['lost']
ARGUMENTS = {'ds_name' : { 'value':'my_lost_ds.zip',
                            'help': 'Name of the packed ds'},
             'pe_id' : { 'value':'-',
                            'help': 'Select the pipeline element that should be exported'},
             'write_csv' : { 'value': True,
                            'help': 'Write dataset in csv format'},
             'write_parquet' : { 'value': True,
                            'help': 'Write dataset in parquet format'}
            }

class LostScript(script.Script):
    '''This Script creates a packed ds
    '''
    def main(self):
        alien = self.get_alien_element(self.get_arg('pe_id'))
        df = alien.outp.to_df()
        fs_name = df.img_fs_name.unique()[0]
        src_fs = self.get_filesystem(name=fs_name)
        dst_fs = self.get_filesystem()
        ds = lds.LOSTDataset(df, src_fs)
        root_path = self.get_path(self.get_arg('ds_name'), context='instance')
        # p_path = os.path.join(os.path.join(root_path, 'ds.parquet'))
        # csv_path = os.path.join(os.path.join(root_path, 'ds.csv'))

        # ds.df['img_path'] = ds.df['abs_path']

        # with fs.open(root_path, 'wb') as f:
        #     zip_fs = ZipFileSystem(f, )
        #     # lds.pack_ds(root_path, filesystem=)

        # with fs.open(out_dir, 'ab') as f:
        #     with ZipFile(f, 'a') as zip:

        with dst_fs.open(root_path, 'wb') as f:
            with ZipFile(f, 'w') as zip_file:
                df = lds.pack_ds(ds.df, root_path, filesystem=src_fs, zip_file=zip_file)
                df['img_path'] = df['img_path'].apply(lambda x: os.path.join(*x.split('/')[-2:]))
                out_base = os.path.basename(root_path)
                out_base = os.path.splitext(out_base)[0]
                zip_dir_parquet = os.path.join(out_base, 'ds.parquet')
                zip_dir_csv = os.path.join(out_base, 'ds.csv')
                df = prep_parquet(df)
                if self.get_arg('write_parquet'):
                    with BytesIO() as bytestream:
                    # bytestream = BytesIO()
                        df.to_parquet(bytestream)
                        bytestream.seek(0)
                        zip_file.writestr(zip_dir_parquet, bytestream.read())
                if self.get_arg('write_csv'):
                    with BytesIO() as bytestream:
                    # bytestream = BytesIO()
                        df.to_csv(bytestream, sep=',', header=True, index=False)
                        bytestream.seek(0)
                        zip_file.writestr(zip_dir_csv, bytestream.read())
                # bytestream.close()
        self.logger.info('wrote file: {}'.format(root_path))
        self.outp.add_data_export(file_path=root_path, fs=dst_fs)
        # else:
        #     df = lds.pack_ds(ds.df, root_path, filesystem=src_fs)
        #     df['img_path'] = df['img_path'].apply(lambda x: os.path.join(*x.split('/')[-2:]))
        #     self.logger.info('File path parquet: {}'.format(p_path))
        #     self.logger.info('File path csv: {}'.format(csv_path))

        #     if self.get_arg('write_parquet'):
        #         lds.LOSTDataset(df, fs).to_parquet(p_path)
        #     if self.get_arg('write_csv'):
        #         with fs.open(csv_path, 'wb') as f:
        #             df.to_csv(f,sep=',',
        #                     header=True,
        #                     index=False)

if __name__ == "__main__":
    my_script = LostScript()
