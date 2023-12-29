from flask_restx import Resource
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.api.api import api
from lost.db import access, roles
from lost.settings import LOST_CONFIG, DATA_URL
from lost.logic.sia import SiaSerialize, SiaUpdateOneThing, get_image_progress
from lost.api.dataset.endpoint import datasetImageSearchRequestModel
import json

namespace = api.namespace('annotasks', description='AnnoTask API.')

@namespace.route('/<int:annotask_id>/review')
@api.doc(security='apikey')
class AnnotaskReview(Resource):
    @api.doc(description="Get data for the next annotask review image")
    @jwt_required
    def post(self, annotask_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401
        
        data = request.json
        serialized_review_data = self.__review(dbm, annotask_id, user.idx, data)
        
        return serialized_review_data
    
    
    def __review(self, dbm, annotask_id, user_id, data):
        
        annotask = dbm.get_anno_task(anno_task_id=annotask_id)
        direction = data['direction']
        current_idx = data['imageAnnoId']
        iteration = data['iteration']
        
        first_annotation = dbm.get_sia_review_first(annotask.idx, iteration)
        
        # get annotask selected by user or the first one if he didn't select one
        current_annotask_idx = data['annotaskIdx'] if 'annotaskIdx' in data else annotask.idx
        current_annotask = annotask

        if direction == 'first':
            image_anno = first_annotation
        elif direction == 'next':
            # get the next image of the same annotation task
            image_anno = dbm.get_sia_review_next(annotask.idx, current_idx, iteration)
        elif direction == 'previous':
            # get the previous image of the same annotation task
            image_anno = dbm.get_sia_review_prev(current_annotask.idx, current_idx, iteration)
        elif direction == "specificImage":
            image_anno = dbm.get_sia_review_id(annotask_id, current_idx, iteration)
        
        if not image_anno:
            return 'no annotation found'
        
        anno_current_image_number, anno_total_image_amount = get_image_progress(dbm, annotask, image_anno.idx, iteration)
            
        # check if user moved to the first of all images
        is_first_image = False
        if first_annotation.idx == image_anno.idx:
            is_first_image = True

        # check if user moved to the last of all images
        is_last_image = False
        if anno_current_image_number == anno_total_image_amount:
            is_last_image = True

        sia_serialize = SiaSerialize(image_anno, user_id, DATA_URL, is_first_image, is_last_image, anno_current_image_number, anno_total_image_amount)
        json_response = sia_serialize.serialize()
        
        # add current annotation task index to response
        json_response['current_annotask_idx'] = current_annotask_idx

        return json_response


@namespace.route('/<int:annotask_id>/review/searchImage')
@api.doc(security='apikey')
class DatasetReviewImageSearch(Resource):
    @api.doc(description="Get data for the next dataset review annotation")
    @api.expect(datasetImageSearchRequestModel)
    @jwt_required
    def post(self, annotask_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401
        
        data = request.json
        search_str = data['filter']

        db_result = dbm.get_search_images_in_annotask(annotask_id, search_str)
        
        found_images = []
        
        for entry in db_result:
            found_images.append({
                'imageId': entry.idx,
                'imageName': entry.img_path,
                'annotationId': entry.anno_task_id,
                'annotationName': entry.name
            })
        
        return found_images


@namespace.route('/<int:annotask_id>/updateAnnotation')
@api.doc(security='apikey')
class UpdateOneThing(Resource):
    @jwt_required 
    def post(self, annotask_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.ANNOTATOR), 401
        else:
            data = json.loads(request.data)
            try:
                if not 'anno' in data:
                    if data['action'] not in ['imgAnnoTimeUpdate', 'imgJunkUpdate', 'imgLabelUpdate']:
                        raise Exception('Expect either anno or img information!')
                anno_task = dbm.get_anno_task(anno_task_id=annotask_id)
                sia_update = SiaUpdateOneThing(dbm, data, user.idx, anno_task)
                re = sia_update.update()
                dbm.close_session()
            except:
                dbm.close_session()
                raise
            return re
