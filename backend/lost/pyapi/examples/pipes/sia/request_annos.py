from lost.pyapi import script
import os

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
class LostScript(script.Script):
    '''Request annotations for each image of an imageset.

    An imageset is basicly a folder with images.
    '''
    def main(self):
        # raise Exception('JJ-Test')
        for ds in self.inp.datasources:
            media_path = ds.path
            fs = ds.get_fs()
            annos = []
            anno_types = []
            if self.get_arg('polygon').lower() == 'true':
                polygon= [[0.1,0.1],[0.4,0.1],[0.2,0.3]]
                annos.append(polygon)
                anno_types.append('polygon')
            if self.get_arg('line').lower() == 'true':
                line= [[0.5,0.5],[0.7,0.7]]
                annos.append(line)
                anno_types.append('line')
            if self.get_arg('point').lower() == 'true':
                point= [0.8,0.1]
                annos.append(point)
                anno_types.append('point')
            if self.get_arg('bbox').lower() == 'true':
                box= [0.6,0.6,0.1,0.05]
                annos.append(box)
                anno_types.append('bbox')
            for img_path in fs.ls(media_path):
                self.outp.request_annos(img_path=img_path, annos=annos, anno_types=anno_types, fs=fs)
                self.logger.info('Requested annos for: {}'.format(img_path))

if __name__ == "__main__":
    my_script = LostScript() 
