from lost.pyapi import script
from imageai.Detection import ObjectDetection
import os
import random
import urllib.request
import shutil
import numpy as np
import skimage.io

ENVS = ['lost-cv']
ARGUMENTS = {'model_url' : { 'value':'https://github.com/OlafenwaMoses/ImageAI/releases/download/1.0/yolo.h5',
                            'help': 'Pretrained yolov3 model for ImageAI lib'},
            'conf_thresh' : { 'value' : '50',
                            'help': 'Confidence threshold in percent'}
            }

def download_model(s):
    model_url = s.get_arg('model_url')
    model_path = s.get_path(os.path.basename(model_url), context='static')
    if os.path.exists(model_path):
        return model_path
    s.logger.info('Donwload yolo model from: {}'.format(model_url))
    with urllib.request.urlopen(model_url) as response, open(model_path, 'wb') as out_file:
        shutil.copyfileobj(response, out_file)
    s.logger.info('Stored model file in static context: {}'.format(model_path))
    return model_path

def get_sim_classes(lbls, lbl_map):
    res_list = []
    for lbl in lbls:
        if lbl not in lbl_map:
            if lbl_map:
                new_id = max(lbl_map.values()) + 1
            else:
                new_id = 0
            lbl_map[lbl] = new_id
        res_list.append(lbl_map[lbl])
    return res_list

def convert_annos(annos, img):
    old = np.array(annos) #[[xmin, ymin, xmax, ymax]...]
    new = old.copy() # should become [[xc, yc, w, h]...]
    new[:,[2,3]] = old[:,[2,3]] - old[:,[0,1]]
    new[:,[0,1]] = old[:,[0,1]] + new[:,[2,3]] / 2.0
    h, w, _ = img.shape
    new = new.astype(float)
    #to relative format
    new[:,[0,2]] = new[:,[0,2]] / w
    new[:,[1,3]] = new[:,[1,3]] / h
    return new.tolist()

class RequestYoloAnnos(script.Script):
    '''Request annotations and yolov3 bbox proposals for each image of an imageset.

    An imageset is basicly a folder with images.
    '''
    def main(self):
        lbl_map = {}
        model_path = download_model(self)
        self.logger.info('Load model into memory')
        detector = ObjectDetection()
        detector.setModelTypeAsYOLOv3()
        detector.setModelPath(model_path)
        detector.loadModel()
        self.logger.info('Loaded model into memory!')
        for raw_file in self.inp.raw_files:
            media_path = raw_file.path
            file_list = os.listdir(media_path)
            total = float(len(file_list))
            for index, img_file in enumerate(file_list):
                img_path = os.path.join(media_path, img_file)
                detections = detector.detectObjectsFromImage(input_image=img_path,
                    minimum_percentage_probability=float(self.get_arg('conf_thresh')))
                annos = [box['box_points'] for box in detections]
                annos = convert_annos(annos, skimage.io.imread(img_path))
                lbls = [box['name'] for box in detections]
                sim_classes = get_sim_classes(lbls, lbl_map)
                self.outp.request_bbox_annos(img_path=img_path, boxes=annos, sim_classes=sim_classes)
                self.logger.info('Requested bbox annos for: {}\n{}\n{}'.format(img_path, annos, lbls))
                self.update_progress(index*100/total)

if __name__ == "__main__":
    my_script = RequestYoloAnnos() 
