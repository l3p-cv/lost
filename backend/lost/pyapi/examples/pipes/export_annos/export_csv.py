from lost.pyapi import script
import os
import pandas as pd

class ExportCsv(script.Script):
    '''This Script creates a csv file from image annotations and adds a data_export
    to the output of this script in pipeline.
    '''
    def main(self):
        script_in = self.inp
        script_out = self.outp
        instance_path = self.instance_context

        csv_output = list()
        for anno in script_in.img_annos:
            for label in anno.labels:
                csv_output.append([anno.img_path, label.idx,
                                   label.name])
        df = pd.DataFrame(csv_output)
        df.columns = ['img_path', 'label_id', 'label_name']
        csv_path = self.get_path("annos.csv", context='instance')
        df.to_csv(path_or_buf=csv_path,
                      sep=',',
                      header=True,
                      index=False)
        script_out.add_data_export(file_path=csv_path)

if __name__ == "__main__":
    my_script = ExportCsv()
