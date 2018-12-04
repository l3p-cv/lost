from lost.pyapi import script
import os
from os.path import join
import json
import imghdr
from shutil import copyfile
import time

ARGUMENTS = {'file_name' : {'value': 'anno_export.csv',
                            'help': 'Name of the file to export'}
            }

class ExportAnnos(script.Script):
    '''Export for each iteration all annotations from previous elements in the pipeline.
    '''

    def main(self):
        df = self.inp.get_anno_df()
        export_filename = '{}-{}'.format(self.iteration, 
                                            self.get_arg('file_name'))
        export_path = self.get_path(export_filename)
        df.to_csv(export_path, index=False)
        self.outp.add_data_export(file_path=export_path)

if __name__ == "__main__":
    my_script = ExportAnnos()
