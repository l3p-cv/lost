from lost.pyapi import script
import os

ENVS = ['lost']

class LostScript(script.Script):
    '''This Script requests image annotations for each image of an imageset.

    An imageset is basicly a folder with images.
    '''
    def main(self):
        self.logger.info("Request image annotations for:")
        for ds in self.inp.datasources:
            media_path = ds.path
            fm = ds.get_fm()
            for img_path in fm.fs.ls(media_path):
                self.outp.request_image_anno(img_path=img_path, fm=fm)
                self.logger.debug(img_path)

if __name__ == "__main__":
    my_script = LostScript()
