from lost.pyapi import script
import os

EXECUTORS = ['web']

class AnnoAllImgs(script.Script):
    '''This Script requests image annotations for each image of an imageset.

    An imageset is basicly a folder with images.
    '''
    def main(self):
        self.logger.info("Request image annotations for:")
        for raw_file in self.inp.raw_files:
            media_path = raw_file.path
            for img_file in os.listdir(media_path):
                img_path = os.path.join(media_path, img_file)
                self.outp.request_image_anno(img_path=img_path)
                self.logger.debug(img_path)

if __name__ == "__main__":
    my_script = AnnoAllImgs()
