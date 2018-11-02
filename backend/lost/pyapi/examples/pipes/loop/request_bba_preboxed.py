from lost.pyapi import script
import os
import random

class RequestBBAPreBoxed(script.Script):
    '''Request bbox annotations for each image of an imageset and pre assign an
    arbitrary bbox with a random label.

    An imageset is basicly a folder with images.
    '''
    def main(self):
        possible_labels = []
        for sia_task in self.outp.sia_tasks:
            possible_labels += sia_task.possible_labels
        for mia_task in self.outp.mia_tasks:
            possible_labels += mia_task.possible_labels
        self.logger.debug(possible_labels)
        test_bbs = [[0.5, 0.5, 0.1,0.1],
                    [0.2, 0.2, 0.07, 0.07]]
        test_lbls = [[random.choice(possible_labels)[0]], [None]]
        for raw_file in self.inp.raw_files:
            media_path = raw_file.path
            for img_file in os.listdir(media_path):
                img_path = os.path.join(media_path, img_file)
                self.outp.request_bba(img_path=img_path, boxes=test_bbs,
                                       label_list=test_lbls)

if __name__ == "__main__":
    my_script = RequestBBAPreBoxed()
