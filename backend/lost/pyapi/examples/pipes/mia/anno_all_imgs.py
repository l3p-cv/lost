from lost.pyapi import script
import os

ENVS = ['lost']

class AnnoAllImgs(script.Script):
    '''This Script requests image annotations for each image of an imageset.

    An imageset is basicly a folder with images.
    '''
    def main(self):
        self.logger.info("Request image annotations for:")
        for ds in self.inp.datasources:
            media_path = ds.path
            for img_file in os.listdir(media_path):
                img_path = os.path.join(media_path, img_file)
                self.outp.request_image_anno(img_path=img_path)
                self.logger.debug(img_path)

if __name__ == "__main__":
    my_script = AnnoAllImgs()
