from l3py.api import script
import os
import random
import json

EXECUTORS = ['web']
ARGUMENTS = {'n' : { 'value': 20,
                    'help': 'Number of images that will be request during each iteration.'}
            }

class RequestLoopAnnos(script.Script):
    '''Annotations in a loop setup.
    '''
    def main(self):
        used_path = self.get_path('used.json')
        used = []
        j = 0
        if os.path.exists(used_path):
            with open('used_path', 'r') as f:
                used =json.load(f)
        for raw_file in self.inp.raw_files:
            media_path = raw_file.path
            for i, img_file in enumerate(os.listdir(media_path)):
                img_path = os.path.join(media_path, img_file)
                if img_file not in used:
                    self.outp.request_bbox_annos(img_path=img_path)
                    self.logger.info('Requested bbox annos for: {}'.format(img_path))
                    used.append(img_file)
                    j += 1
                if j >= int(self.get_arg('n')):
                    break
        total = len(os.listdir(media_path))
        if i+1 >= total:
            self.break_loop()
            self.logger.info('Break LOOP!') 
        with open(used_path, 'w') as f:
            json.dump(used, f)
            self.logger.info('Dump used image list to: {}'.format(used_path))

if __name__ == "__main__":
    my_script = RequestLoopAnnos()
