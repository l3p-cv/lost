from lost.pyapi import script
import os

class RequestBBA(script.Script):
    '''Request bbox annotations for each RawFile.

    A RawFile represents a single file or a folder path.
    '''
    def main(self):
        script_in = self.inp
        script_out = self.outp
        for raw_file in script_in.raw_files:
            media_path = raw_file.get_path()
            for img_file in os.listdir(media_path):
                img_path = os.path.join(media_path, img_file)
                script_out.request_bba(img_path=img_path)

if __name__ == "__main__":
    my_script = RequestBBA()
