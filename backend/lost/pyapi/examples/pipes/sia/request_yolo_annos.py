from lost.pyapi import script
from imageai.Detection import ObjectDetection
import os
import random
import urllib.request
import shutil

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

class RequestYoloAnnos(script.Script):
    '''Request annotations and yolov3 bbox proposals for each image of an imageset.

    An imageset is basicly a folder with images.
    '''
    def main(self):
        model_path = download_model(self)
        self.logger.info('Load model into memory')
        detector = ObjectDetection()
        detector.setModelTypeAsYOLOv3()
        detector.setModelPath(model_path)
        detector.loadModel()
        self.logger.info('Loaded model into memory!')
        for raw_file in self.inp.raw_files:
            media_path = raw_file.path
            for img_file in os.listdir(media_path):
                img_path = os.path.join(media_path, img_file)
                detections = detector.detectObjectsFromImage(input_image=img_path,
                    minimum_percentage_probability=float(self.get_arg('conf_thresh')))
                annos = [box['box_points'] for box in detections]
                lbls = [box['name'] for box in detections]
                self.outp.request_bbox_annos(img_path=img_path, boxes=annos, sim_classes=lbls)
                self.logger.info('Requested bbox annos for: {}\n{}\n{}'.format(img_path, annos, lbls))

if __name__ == "__main__":
    my_script = RequestYoloAnnos() 
