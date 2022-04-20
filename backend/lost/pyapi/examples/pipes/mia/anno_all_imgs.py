from lost.pyapi import script
import os

ENVS = ['lost']
ARGUMENTS = {'recursive' : { 'value': 'true',
                            'help': 'Walk recursive through folder structure'},
            'valid_imgtypes' : { 'value': "['.jpg', '.jpeg', '.png', '.bmp']",
                            'help': 'Img types where annotations will be requested for!'}
            }
class LostScript(script.Script):
    '''Request annotations for each image of an imageset.

    An imageset is basicly a folder with images.
    '''

    def check_and_request(self, fm, path):
        if fm.fs.isfile(path):
            if os.path.splitext(path)[1].lower() in self.get_arg('valid_imgtypes'):
                self.outp.request_annos(img_path=path, fm=fm)
                self.logger.info('Requested annos for: {}'.format(path))
            else:
                self.logger.warning(f'{path} no valid img file!')
        else:
            self.logger.warning(f'{path} is no valid file!')
        
    def main(self):
        for ds in self.inp.datasources:
            media_path = ds.path
            fm = ds.get_fm()
            if self.get_arg('recursive'):
                for root, dirs, files in fm.fs.walk(media_path):
                    for f in files:
                        path = os.path.join(root, f)
                        self.check_and_request(fm, path)
            else:
                for img_path in fm.fs.ls(media_path):
                    self.check_and_request(fm, img_path)

if __name__ == "__main__":
    my_script = LostScript() 