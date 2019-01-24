from l3py.api import script
import os
import random

EXECUTORS = ['web']
ARGUMENTS = {'gen_boxes' : { 'value': 'false',
                            'help': 'Generate dummy box proposals'}
            }

class RequestBBAPreBoxed(script.Script):
    '''Request bbox annotations for each image of an imageset and pre assign an
    arbitrary bbox with a random label.

    An imageset is basicly a folder with images.
    '''
    def main(self):
        if self.get_arg('gen_boxes').lower() == 'true':
            test_bbs = [[0.5, 0.5, 0.1,0.1],
                        [0.2, 0.2, 0.07, 0.07]]
        else:
            test_bbs = []
        for raw_file in self.inp.raw_files:
            media_path = raw_file.path
            for img_file in os.listdir(media_path):
                img_path = os.path.join(media_path, img_file)
                self.outp.request_bbox_annos(img_path=img_path, boxes=test_bbs)
                self.logger.info('Requested bbox annos for: {}'.format(img_path))
                self.logger.debug('boxes are: {}'.format(test_bbs))

if __name__ == "__main__":
    my_script = RequestBBAPreBoxed()
