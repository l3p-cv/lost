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

    def check_and_request(self, fs, path):
        if fs.isfile(path):
            if os.path.splitext(path)[1].lower() in self.get_arg('valid_imgtypes'):
                self.outp.request_annos(path, fs=fs)
                self.logger.info('Requested annos for: {}'.format(path))
            else:
                self.logger.warning(f'{path} no valid img file!')
        else:
            self.logger.warning(f'{path} is no valid file!')
        
    def main(self):
        for ds in self.inp.datasources:
            media_path = ds.path
            fs = ds.get_fs()
            if self.get_arg('recursive'):
                for root, dirs, files in fs.walk(media_path):
                    for f in files:
                        path = os.path.join(root, f)
                        self.check_and_request(fs, path)
            else:
                for img_path in fs.ls(media_path):
                    self.check_and_request(fs, img_path)

if __name__ == "__main__":
    my_script = LostScript() 
