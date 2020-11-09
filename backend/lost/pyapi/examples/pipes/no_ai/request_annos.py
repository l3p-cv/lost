from lost.pyapi import script
import os
import random

ENVS = ['lost']
ARGUMENTS = {'polygon' : { 'value':'false',
                            'help': 'Add a dummy polygon proposal as example.'},
            'line' : { 'value':'false',
                            'help': 'Add a dummy line proposal as example.'},
            'point' : { 'value':'false',
                            'help': 'Add a dummy point proposal as example.'},
            'bbox' : { 'value':'false',
                            'help': 'Add a dummy bbox proposal as example.'}
            }
class RequestAnnos(script.Script):
    '''Request annotations for each image of an imageset.

    An imageset is basicly a folder with images.
    '''
    def main(self):
        for ds in self.inp.datasources:
            media_path = ds.path
            annos = []
            anno_types = []
            lbls = []
            for annotask in self.outp.anno_tasks:
                possible_labels = annotask.possible_label_df['idx'].values.tolist()
            if self.get_arg('polygon').lower() == 'true':
                polygon= [[0.1,0.1],[0.4,0.1],[0.2,0.3]]
                annos.append(polygon)
                anno_types.append('polygon')
                lbls.append(random.sample(possible_labels, 2))
            if self.get_arg('line').lower() == 'true':
                line= [[0.5,0.5],[0.7,0.7]]
                annos.append(line)
                anno_types.append('line')
                lbls.append(random.sample(possible_labels, 3))
            if self.get_arg('point').lower() == 'true':
                point= [0.8,0.1]
                annos.append(point)
                anno_types.append('point')
                lbls.append(random.sample(possible_labels, 1))
            if self.get_arg('bbox').lower() == 'true':
                box= [0.6,0.6,0.1,0.05]
                annos.append(box)
                anno_types.append('bbox')
                lbls.append(random.sample(possible_labels, 2))
            # request annotation only for 'jpg','jpeg', 'bmp' and 'png' image type
            imgfile_filter = ['.jpg','.jpeg','.bmp','.png'] 
            for dirpath, dirnames, filenames in os.walk(media_path):
                for file in filenames:
                    if any(file.endswith(filter) for filter in imgfile_filter):
                        img_path = os.path.join(media_path, dirpath, file)
                        self.outp.request_annos(img_path=img_path, annos=annos, anno_types=anno_types, anno_labels=lbls)
                        self.logger.info('Requested annos for: {}'.format(img_path))

if __name__ == "__main__":
    my_script = RequestAnnos() 
