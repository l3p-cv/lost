from lost.pyapi import script
import os
from lost_ds import LOSTDataset

ENVS = ['lost']
ARGUMENTS = {
            'img_path_key' : { 'value':'img_path',
                            'help': 'Name of Column that should be used im img_path'},
            'ignore_lbls' : { 'value':'[]',
                            'help': 'List of labels to ignore for annotation request'},
            'remap_path' : { 'value':'-',
                            'help': 'If not *-*, remap img path to remap_path'},
            'original_anno_keys' : { 'value':'[]',
                            'help': 'If not *-*, use row content given keys as meta information for this annotation. If *all*, all keys will used as meta information'},
            'original_img_keys' : { 'value':'[]',
                            'help': 'If not *-*, use row content of given keys as meta information for image annotation.'}
            }

class LostScript(script.Script):
    '''Request annotations for each image of an imageset.

    An imageset is basicly a folder with images.
    '''
    def main(self):
        for ds in self.inp.datasources:
            anno_file_path = ds.path
            fs = ds.get_fs()
            lds = LOSTDataset(anno_file_path)
            if self.get_arg('ignore_lbls') is not None:
                lds.ignore_labels(self.get_arg('ignore_lbls'), col='anno_lbl', inplace=True)
            if self.get_arg('remap_path') is not None:
                lds.remap_img_path(self.get_arg('remap_path'), inplace=True)
            if self.get_arg('original_anno_keys') is None:
                original_anno_keys = []
            else:
                original_anno_keys = self.get_arg('original_anno_keys')
            if self.get_arg('original_img_keys') is None:
                original_img_keys = []
            else:
                original_img_keys = self.get_arg('original_img_keys')
            self.outp.request_lds_annos(lds, fs, original_anno_keys, original_img_keys, self.get_arg('img_path_key'))

if __name__ == "__main__":
    my_script = LostScript() 
