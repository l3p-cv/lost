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
                    try:
                        sim_class_list.append(bbox.to_df()['anno_lbl_id'].values[0])
                    except:
                        sim_class_list.append(None)
                    boxes.append(bbox.bbox)
                if len(boxes)>0:
                    self.outp.request_annos(img, 
                        annos=boxes, 
                        anno_types=['bbox']*len(boxes),
                        anno_sim_classes=sim_class_list) 
        self.logger.info(f"""Requested the following annos: \n{
            self.outp.to_vec(['anno_data', 'anno_sim_class', 'img_path'])
            }""")

if __name__ == "__main__":
    my_script = LostScript()
