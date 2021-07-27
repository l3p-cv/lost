from lost.pyapi import script
import os
import random

class LostScript(script.Script):
    '''Set sim class for already present bounding boxes and request them again for annotation.
    
    Note:
        sim_classes from first annotation stage will be used.
    '''
    def main(self):
        possible_labels = []
        for i, img in enumerate(self.inp.img_annos): 
            # Required if you are in a loop
            if img.iteration == self.iteration:
                boxes = []
                sim_class_list = []
                for bbox in img.iter_annos('bbox'):
                    # Use yolo sim_class predictions from first
                    # annotation stage for clustring in MIA
                    sim_class_list.append(bbox.sim_class)
                    boxes.append(bbox.bbox)
                if len(boxes)>0:
                    self.outp.request_bbox_annos(img.img_path, 
                        boxes=boxes, 
                        sim_classes=sim_class_list) 
        self.logger.info("Requested the following annos: \n{}".format(
            self.outp.to_vec(['anno.data', 'anno.sim_class', 'img.img_path'])))

if __name__ == "__main__":
    my_script = LostScript()
