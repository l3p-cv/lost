from lost.pyapi import script
import os
import random

class ClusterBoxes(script.Script):
    '''Set sim class for already present bounding boxes and request them again for annotation.
    
    Note:
        sim_class will be set equal for every second box
    '''
    def main(self):
        possible_labels = []
        for i, img in enumerate(self.inp.img_annos): 
            boxes = []
            sim_class_list = []
            for bbox in img.bbox_annos:
                if i%2==0:
                    sim_class_list.append(1)
                else:
                    sim_class_list.append(2)
                boxes.append(bbox.box)
            self.outp.request_bba(img.img_path, boxes=boxes, sim_classes=sim_class_list) 

if __name__ == "__main__":
    my_script = ClusterBoxes()
