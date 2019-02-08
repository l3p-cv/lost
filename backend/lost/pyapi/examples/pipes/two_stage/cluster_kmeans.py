from lost.pyapi import script, anno_helper
import os
from sklearn.cluster import KMeans
import numpy as np
from keras.applications.resnet50 import ResNet50
from keras.preprocessing import image
from keras.applications.resnet50 import preprocess_input
from keras.models import Model

from keras.preprocessing import image as keras_image
import skimage.io

ENVS = ['lost-cv']
ARGUMENTS = {'n-clusters' : {'value': 20,
                            'help': 'Expected number of clusters - should be equal to number of classes.'},
            'feat_layer' : {'value': 'avg_pool',
                            'help': 'Layer to extract features from for ResNet50.'}
            }
class ClusterKMeans(script.Script):
    '''This Script clusters all annotation from previous stage and requests annotations for each cluster.

    For each image in a folder CNN features are extracted. 
    After that all images will be clustered with KMeans and 
    image annotation will be requested.
    '''
    def main(self):
        n_cluster = int(self.get_arg('n-clusters'))
        self.logger.info('Will load keras model')
        base_model = ResNet50(weights='imagenet')
        self.logger.info('Keras model loaded')
        layer_code = self.get_arg('feat_layer')
        # base_model.summary()
        model = Model(inputs=base_model.input, outputs=base_model.get_layer(layer_code).output)
        feature_list = []
        img_path_list = []
        self.logger.info('Will compute CNN features')
        # Request only MIA annotations for annotations of first stage
        # that have been annotated in current iteration cycle.
        img_annos = list(filter(lambda x: x.iteration == self.iteration, 
            self.inp.img_annos))
        total = len(img_annos)
        anno_map = {}
        for index, img_anno in enumerate(img_annos):
            annos = img_anno.to_vec('anno.data')
            if annos:
                types = img_anno.to_vec('anno.dtype')
                anno_map[img_anno.img_path] = {
                                                'annos': annos, 
                                                'types': types,
                                                'sim_classes': []
                                            }
                img = skimage.io.imread(self.get_abs_path(img_anno.img_path))
                crops, anno_boxes = anno_helper.crop_boxes(annos, types, 
                    img, context=0.01)
                for crop in crops:
                    # img = image.load_img(img_path, target_size=(224, 224))
                    crop_img = image.img_to_array(image.array_to_img(crop, scale=False).resize((224,224)))
                    x = keras_image.img_to_array(crop_img)
                    x = np.expand_dims(x, axis=0)
                    x = preprocess_input(x)
                    # extract features
                    features = model.predict(x)
                    feature_list.append(features[0].flatten())
                    img_path_list.append(img_anno.img_path)
                self.update_progress(index*90/total)
        self.logger.info('Computed CNN features!')
        self.logger.info('Start KMeans clustering')
        kmeans = KMeans(n_clusters=n_cluster, random_state=0).fit(feature_list)
        self.logger.info('Clustering completed!')
        # Map similarity classes back to images
        for sim_class, img_path in zip(kmeans.labels_, img_path_list):
            anno_map[img_path]['sim_classes'].append(sim_class)
        # Finally request image annotations
        counter = 0        
        for img_path, val in anno_map.items():
            self.outp.request_annos(img_path, 
                anno_sim_classes=val['sim_classes'],
                annos=val['annos'],
                anno_types=val['types'])
            self.logger.info('''Requested annotations for: {}\n
                                Clusters: {}\n
                                Anno_types: {}\n)'''.format(
                                    img_path, 
                                    val['sim_classes'],
                                    val['types']
                                )
                            )
            counter += 1
            self.update_progress(90 + (counter*10/len(img_path_list)))

if __name__ == "__main__":
    my_script = ClusterKMeans()
