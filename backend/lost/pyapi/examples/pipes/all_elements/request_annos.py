from lost.pyapi import script
import os
import random

class RequestAnnos(script.Script):
    '''Request annotations for all images in a Rawfile folder.
    
    An imageset is basicly a folder with images.
    '''
    def main(self):
        for ds in self.inp.datasources:
            media_path = ds.path
            fs = ds.get_fs()
            for img_file in os.listdir(media_path):
                img_path = os.path.join(media_path, img_file)
                self.outp.request_annos(img_path, fs=fs)
                self.logger.info('Requested annos for {}'.format(img_path))

if __name__ == "__main__":
    my_script = RequestAnnos()
