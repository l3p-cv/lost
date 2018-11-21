from lost.pyapi import script
import os

EXECUTORS = ['web']

class AnnoAllImgs(script.Script):
    '''This Script requests image annotations for each image in a folder.

    The path to the image folder will be provided by a connected 
    Datasource of type *RawFile* element.
    '''
    def main(self):
        for raw_file in self.inp.raw_files:
            media_path = raw_file.path
            for img_file in os.listdir(media_path):
                img_path = os.path.join(media_path, img_file)
                self.outp.request_image_anno(img_path)
                self.logger.info('Requested image annotation for: {}'.format(img_path))

if __name__ == "__main__":
    my_script = AnnoAllImgs()
