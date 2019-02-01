from lost.pyapi import script
import os
import numpy as np
from keras.applications.resnet50 import ResNet50
from keras.preprocessing import image
from keras.applications.resnet50 import preprocess_input
from keras.models import Model

from keras.preprocessing import image as keras_image

ENVS = ['lost-cv-gpu','lost-cv']
#Lock all resources of a worker when this script is executed. 
#This will prevent worker from executing other scripts while this script is executed.
RESOURCES = ['lock_all'] 
class ClusterAndAnno(script.Script):
    '''This Script clusters all images and requests annotations for each cluster.

    For each image a class label will be predicted with ResNet50.
    This class label will be used to cluster the images.
    '''
    def main(self):
        self.logger.info('Will load keras model')
        model = ResNet50(weights='imagenet')
        self.logger.info('Keras model loaded')
        feature_list = []
        img_path_list = []
        for raw_file in self.inp.raw_files:
            media_path = raw_file.path
            file_list = os.listdir(media_path)
            total = float(len(file_list))
            for index, img_file in enumerate(file_list):
                img_path = os.path.join(media_path, img_file)
                img_path_list.append(img_path)
                img = image.load_img(img_path, target_size=(224, 224))
                x = keras_image.img_to_array(img)
                x = np.expand_dims(x, axis=0)
                x = preprocess_input(x)
                # extract features
                scores = model.predict(x)
                sim_class = np.argmax(scores)
                print('Scores {}\nSimClass: {}'.format(scores, sim_class))
                self.outp.request_annos(img_path, img_sim_class=sim_class)
                self.logger.info('Requested annotation for: {} (cluster: {})'.format(img_path, sim_class))
                self.update_progress(index*100/total)
if __name__ == "__main__":
    my_script = ClusterAndAnno()
