from lost.pyapi import script
import os
from os.path import join
import json
import imghdr
from shutil import copyfile
import time

ARGUMENTS = {'file_name' : {'value': 'bboxes.json',
                            'help': 'Name of the file to export'}
            }

class ExportBBoxJson(script.Script):
    '''Export for each iteration all BBoxAnnoations of the previous element in the pipeline.

    Note: Format of json will be like this:
        {"pipe_name" : "name",
        "timestamp" : "datetime",
        "description" : "pipe description",
        "img_annos" : [{"img_path":"relative/path/to/img",
                        "timestamp" : "datetime",
                        "timestamp_lock" : "datetime",
                        "iteration" : 1,
                        "boxes" : [{"x" : 0.1,
                                    "y" : 0.12,
                                    "w" : 0.2,
                                    "h" : 0.02,
                                    "iteration" : 1,
                                    "timestamp" : "datetime",
                                    "timestamp_lock" : "datetime",
                                    "labels" : ["label1", "label2"]
                                    }]
                        }]
        }
    Attributes:
        file_name (str): Name of the file where bboxes are stored
    '''

    def main(self):
        script_in = self.inp
        script_out = self.outp
        anno_list = list()
        pipe = {'pipe_name' : self.pipe_info.name,
                'timestamp' : self.pipe_info.timestamp,
                'description' : self.pipe_info.description,
                'img_annos' : anno_list}
        for img_anno in script_in.img_annos:
            img_element = {'img_path' : img_anno.img_path,
                           'timestamp' : str(img_anno.timestamp),
                           'timestamp_lock' : str(img_anno.timestamp_lock),
                           'iteration' : img_anno.iteration,
                           'boxes' : list()}
            for bb_anno in img_anno.bbox_annos:
                box = bb_anno.box
                bb_element = {'x' : box[0],
                              'y' : box[1],
                              'w' : box[2],
                              'h' : box[3],
                              'iteration' : bb_anno.iteration,
                              'timestamp' : str(img_anno.timestamp),
                              'timestamp_lock' : str(img_anno.timestamp_lock),
                              'labels' : list()}
                for label_name in bb_anno.label_names:
                    bb_element['labels'].append(label_name)
                img_element['boxes'].append(bb_element)
            anno_list.append(img_element)
        split_filename = self.get_arg('file_name').split('.')
        export_filename = '{}-{}.{}'.format(split_filename[0],
                                            self.iteration,
                                            split_filename[1])
        export_path = self.write(pipe, export_filename, f_type='json')
        script_out.add_data_export(file_path=export_path)

if __name__ == "__main__":
    my_script = ExportBBoxJson()
