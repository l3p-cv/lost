from lost.pyapi import script
from lost.pyapi.pipe_elements import AnnoTask
import os
import pandas as pd

ENVS = ['lost']
ARGUMENTS = {'pe_id' : { 'value':'[int] pipeline element id of the annotask to export.',
                            'help': 'Pipeline element id of the script to emulate'},
            'file_name' : { 'value':'annos.csv',
                            'help': 'Name of the file with exported bbox annotations.'}
            }

class ExportAnnoTaskOutput(script.Script):
    '''Get AnnoTask element from somewhere in the LOST space and export annotations.
    '''
    def main(self):
        element = self.get_alien_element(int(self.get_arg('pe_id')))
        if isinstance(element, AnnoTask):
            df = element.outp.to_df()
            self.logger.info('Found {} annotations'.format(len(df)))
            csv_path = self.get_path(self.get_arg('file_name'), context='instance')
            df.to_csv(path_or_buf=csv_path,
                        sep=',',
                        header=True,
                        index=False)
            self.outp.add_data_export(file_path=csv_path)
            self.logger.info('Stored export to: {}'.format(csv_path))
        else:
            raise Exception("Expecting the pe_id of an AnnotationTask!")
        
if __name__ == "__main__":
    my_script = ExportAnnoTaskOutput()
