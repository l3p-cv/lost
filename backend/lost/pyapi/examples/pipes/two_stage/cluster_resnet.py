from lost.pyapi import script
from lost.pyapi.utils import anno_helper
import os
import numpy as np
from keras.applications.resnet50 import ResNet50
from keras.preprocessing import image
from keras.applications.resnet50 import preprocess_input
from keras.models import Model
import skimage.io
from skimage.transform import resize

from keras.preprocessing import image as keras_image

ENVS = ['lost-cv-gpu','lost-cv']
#Lock all resources of a worker when this script is executed. 
#This will prevent worker from executing other scripts while this script is executed.
RESOURCES = ['lock_all'] 
class ClusterAndAnno(script.Script):
    '''This Script clusters all twod annotations and requests annotations for each cluster.

    For each image a class label will be predicted with ResNet50.
    This class label will be used to cluster the images.
    '''
    def main(self):
        self.logger.info('Will load keras model')
        model = ResNet50(weights='imagenet')
        self.logger.info('Keras model loaded')
        feature_list = []
        img_path_list = []
        # Request only MIA annotations for annotations of first stage
        # that have been annotated in current iteration cycle.
        img_annos = list(filter(lambda x: x.iteration == self.iteration, 
            self.inp.img_annos))
        total = len(img_annos)
        for index, img_anno in enumerate(img_annos):
            annos = img_anno.to_vec('anno.data')
            if annos:
                types = img_anno.to_vec('anno.dtype')
                img = skimage.io.imread(self.get_abs_path(img_anno.img_path))
                crops, anno_boxes = anno_helper.crop_boxes(annos, types, 
                    img, context=0.01)
                sim_classes = []
                for crop in crops:
                    # img = image.load_img(img_path, target_size=(224, 224))
                    crop_img = image.img_to_array(image.array_to_img(crop, scale=False).resize((224,224)))
                    x = keras_image.img_to_array(crop_img)
                    x = np.expand_dims(x, axis=0)
                    x = preprocess_input(x)
                    # extract features
                    scores = model.predict(x)
                    sim_classes.append(np.argmax(scores))
                self.outp.request_annos(img_anno.img_path, 
                    annos=annos, anno_types=types, anno_sim_classes=sim_classes)
                self.logger.info('Requested annotation for: {}\n{}\n{}'.format(img_anno.img_path, types, sim_classes))
                self.update_progress(index*100/total)
if __name__ == "__main__":
    my_script = ClusterAndAnno()
