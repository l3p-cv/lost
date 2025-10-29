import traceback
import flask
from flask import request
from flask_restx import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.api.api import api
from lost.api.sia.api_definition import (
    sia_anno,
    sia_config,
    labels,
    sia_polygon_operations_response,
    error_model,
    sia_polygon_union,
    sia_polygon_intersection,
    sia_polygon_difference,
    image_filters,
    sia_bbox_from_points,
    sia_bbox_from_points_response,
)
from lost.db import roles, access
from lost.settings import LOST_CONFIG, DATA_URL
from lost.logic import sia
from lost.logic.permissions import UserPermissions
import json
import base64
import cv2
from lost.logic.file_man import FileMan
from shapely.errors import TopologicalError

namespace = api.namespace("sia", description="SIA Annotation API.")


@namespace.route("")
@api.doc(security="apikey")
@api.param("direction", 'One of "next","prev" "current" or "first"')
@api.param("lastImgId", "ID of the last image")
class First(Resource):
    @api.doc(security="apikey", description="Get SIA information")
    @api.marshal_with(sia_anno)
    @jwt_required()
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity: int = int(get_jwt_identity())
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return api.abort(403, "You need to be {} in order to perform this request.".format(roles.ANNOTATOR))
        else:
            direction = request.args.get("direction")
            last_img_id = int(request.args.get("lastImgId"))

            if direction == "first":
                re = sia.get_first(dbm, identity, DATA_URL)
                dbm.close_session()
                return re
            elif direction == "next":
                re = sia.get_next(dbm, identity, last_img_id, DATA_URL)
                dbm.close_session()
                return re
            elif direction == "prev":
                re = sia.get_previous(dbm, identity, last_img_id, DATA_URL)
                dbm.close_session()
                return re
            elif direction == "current":
                re = sia.get_current(dbm, identity, last_img_id, DATA_URL)
                return re

            dbm.close_session()
            return "error", 400

    @api.doc(security="apikey", description="Update whole SIA Annotation")
    @jwt_required()
    @api.expect(sia_anno)
    def put(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return api.abort(403, "You need to be {} in order to perform this request.".format(roles.ANNOTATOR))

        else:
            try:
                data = json.loads(request.data)
                # raise Exception('jj')
                re = sia.update(dbm, data, user.idx)
                dbm.close_session()
                return re
            except:
                msg = traceback.format_exc()
                msg += f"\nuser.idx: {user.idx}, user.name: {user.user_name}\n"
                msg += f"Received data:\n{json.dumps(data, indent=4)}\n"
                flask.current_app.logger.error("{}".format(msg))
                dbm.close_session()
                return "error updating sia anno", 500

    @api.doc(security="apikey", description="Update partial SIA Annotation")
    @jwt_required()
    @api.expect(sia_anno)
    def patch(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return api.abort(403, "You need to be {} in order to perform this request.".format(roles.ANNOTATOR))
        else:
            data = json.loads(request.data)

            try:
                if not "anno" in data:
                    # if not 'imgLabelIds' in data['img']:
                    #     if not 'isJunk' in data['img']:
                    if data["action"] not in ["imgAnnoTimeUpdate", "imgJunkUpdate", "imgLabelUpdate"]:
                        raise Exception("Expect either anno or img information!")
                re = sia.update_one_thing(dbm, data, user.idx)
                dbm.close_session()
            except:
                dbm.close_session()
                raise
            return re


@namespace.route("/image/<int:image_id>")
@api.doc(security="apikey")
class Filter(Resource):
    @api.doc(security="apikey", description="Get SIA Image with applied filter for clahew or rotation")
    @api.param("angle", "Angle to rotate leave clear for no rotation, valid angles are 0,90,180,-90")
    @api.param("clipLimit", "Clip limit for clahe filter leave clear for no clahe")
    @jwt_required()
    def get(self, image_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return api.abort(403, "You need to be {} in order to perform this request.".format(roles.ANNOTATOR))

        else:
            angle = request.args.get("angle")
            clipLimit = request.args.get("clipLimit")

            if angle is not None:
                angle = int(angle)

            if clipLimit is not None:
                clipLimit = int(clipLimit)

            img = dbm.get_image_anno(image_id)
            flask.current_app.logger.info("img.img_path: {}".format(img.img_path))
            flask.current_app.logger.info("img.fs.name: {}".format(img.fs.name))
            # fs_db = dbm.get_fs(img.fs_id)
            fs = FileMan(fs_db=img.fs)
            # img = PIL.Image.open('/home/lost/data/media/10_voc2012/2007_008547.jpg')
            # img = PIL.Image.open(img_path)
            if clipLimit is not None:
                img = fs.load_img(img.img_path, color_type="gray")
            else:
                img = fs.load_img(img.img_path, color_type="color")

            if angle is not None:
                if angle == 90:
                    img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
                elif angle == -90:
                    img = cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE)
                elif angle == 180:
                    img = cv2.rotate(img, cv2.ROTATE_180)
            if clipLimit is not None:
                clahe = cv2.createCLAHE(clipLimit)
                img = clahe.apply(img)

            _, data = cv2.imencode(".jpg", img)
            data64 = base64.b64encode(data.tobytes())
            dbm.close_session()
            return "data:img/jpg;base64," + data64.decode("utf-8")


@namespace.route("/image/<int:image_id>/filters")
@api.doc(security="apikey")
class ImageFilters(Resource):
    @api.doc(security="apikey", description="Get an Image with applied filters")
    @api.expect(image_filters)
    @api.response(
        200, 'Successfully returns base64-encoded JPEG data URI (e.g., "data:img/jpg;base64,<base64_string>").'
    )
    @api.response(403, "Forbidden", error_model)
    @api.response(400, "Bad Request", error_model)
    @api.response(500, "Internal Server Error", error_model)
    @jwt_required()
    def post(self, image_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return api.abort(403, "You need to be {} in order to perform this request.".format(roles.ANNOTATOR))

        try:
            data = json.loads(request.data)
            filters = data.get("filters", [])

            img = dbm.get_image_anno(image_id)
            flask.current_app.logger.info(f"img.img_path: {img.img_path}")
            flask.current_app.logger.info(f"img.fs.name: {img.fs.name}")
            fs = FileMan(fs_db=img.fs)
            img_data = fs.load_img(
                img.img_path, color_type="gray" if any(f["name"] == "cannyEdge" for f in filters) else "color"
            )

            img_data = sia.apply_filters(img_data, filters)

            _, data = cv2.imencode(".jpg", img_data)
            data64 = base64.b64encode(data.tobytes())
            dbm.close_session()
            return "data:img/jpg;base64," + data64.decode("utf-8")
        except ValueError as ve:
            flask.current_app.logger.warning(f"ValueError applying filters: {str(ve)}")
            dbm.close_session()
            return {"error": str(ve)}, 400
        except Exception as e:
            flask.current_app.logger.error(f"Error applying filters: {str(e)}")
            dbm.close_session()
            return {"error": str(e)}, 500


@namespace.route("/allowedExampler")
@api.doc(security="apikey")
class AllowedExampler(Resource):
    @api.doc(
        security="apikey",
        description="Provides the info if the currently logged in user is allowed to mark images as exsamples",
    )
    @jwt_required()
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return api.abort(403, "You need to be {} in order to perform this request.".format(roles.ANNOTATOR))

        else:
            up = UserPermissions(dbm, user)
            return up.allowed_to_mark_example()


@namespace.route("/nextAnnoId")
@api.doc(security="apikey")
class NextAnnoId(Resource):
    # @api.expect(sia_update)
    @api.doc(security="apikey", description="Get the ID of the next annotation")
    @jwt_required()
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return api.abort(403, "You need to be {} in order to perform this request.".format(roles.ANNOTATOR))

        else:
            # raise Exception('JJ')
            re = sia.get_next_anno_id(dbm)
            dbm.close_session()
            return re


@namespace.route("/finish")
@api.doc(security="apikey")
class Finish(Resource):
    @jwt_required()
    @api.doc(security="apikey", description="Finish the current sia task")
    def post(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return api.abort(403, "You need to be {} in order to perform this request.".format(roles.ANNOTATOR))

        else:
            re = sia.finish(dbm, identity)
            dbm.close_session()
            return re


@namespace.route("/label")
@api.doc(security="apikey")
class Label(Resource):
    @api.marshal_with(labels)
    @api.doc(security="apikey", description="Get label trees for the sia task")
    @jwt_required()
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return api.abort(403, "You need to be {} in order to perform this request.".format(roles.ANNOTATOR))
        else:
            re = sia.get_label_trees(dbm, identity)
            dbm.close_session()
            return re


@namespace.route("/configuration")
@api.doc(security="apikey")
class Configuration(Resource):
    @api.doc(security="apikey", description="Get conmfig for the current SIA Task")
    @api.marshal_with(sia_config)
    @jwt_required()
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return api.abort(403, "You need to be {} in order to perform this request.".format(roles.ANNOTATOR))
        else:
            re = sia.get_configuration(dbm, identity)
            dbm.close_session()
            return re


@namespace.route("/polygonOperations/union")
@api.doc(security="apikey")
class PolygonUnion(Resource):
    @api.doc(security="apikey", description="Perform union operation on a list of at least 2 polygons.")
    @api.expect(sia_polygon_union)
    @api.response(200, "Success", sia_polygon_operations_response)
    @api.response(400, "Bad Request", error_model)
    @api.response(403, "Forbidden", error_model)
    @api.response(500, "Internal Server Error", error_model)
    @jwt_required()
    def post(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = int(get_jwt_identity())
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return api.abort(403, "You need to be {} in order to perform this request.".format(roles.ANNOTATOR))
        try:
            data = json.loads(request.data)
            data = sia.normalize_annotations(data)
            flask.current_app.logger.info(f"Normalized payload for union: {data}")
            response = sia.perform_polygon_union(data)
            dbm.close_session()
            return response, 200
        except sia.PolygonOperationError as e:
            flask.current_app.logger.error(f"Validation error in polygon union: {str(e)}")
            dbm.close_session()
            return {"error": str(e)}, 400
        except TopologicalError as e:
            flask.current_app.logger.error(f"Topology error in polygon union: {str(e)}")
            dbm.close_session()
            return {"error": str(e)}, 400
        except Exception as e:
            flask.current_app.logger.error(f"Unexpected error in polygon union: {str(e)}")
            dbm.close_session()
            return {"error": str(e)}, 500


@namespace.route("/polygonOperations/intersection")
@api.doc(security="apikey")
class PolygonIntersection(Resource):
    @api.doc(security="apikey", description="Perform intersection operation on exactly 2 polygons.")
    @api.expect(sia_polygon_intersection)
    @api.response(200, "Success", sia_polygon_operations_response)
    @api.response(400, "Bad Request", error_model)
    @api.response(403, "Forbidden", error_model)
    @api.response(500, "Internal Server Error", error_model)
    @jwt_required()
    def post(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = int(get_jwt_identity())
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return api.abort(403, "You need to be {} in order to perform this request.".format(roles.ANNOTATOR))
        try:
            data = json.loads(request.data)
            data = sia.normalize_annotations(data)
            response = sia.perform_polygon_intersection(data)
            dbm.close_session()
            return response, 200
        except sia.PolygonOperationError as e:
            flask.current_app.logger.error(f"Validation error in polygon intersection: {str(e)}")
            dbm.close_session()
            return {"error": str(e)}, 400
        except TopologicalError as e:
            flask.current_app.logger.error(f"Topology error in polygon intersection: {str(e)}")
            dbm.close_session()
            return {"error": str(e)}, 400
        except Exception as e:
            flask.current_app.logger.error(f"Unexpected error in polygon intersection: {str(e)}")
            dbm.close_session()
            return {"error": str(e)}, 500


@namespace.route("/polygonOperations/difference")
@api.doc(security="apikey")
class PolygonDifference(Resource):
    @api.doc(
        security="apikey",
        description="Perform difference operation on a selected polygon and a list of modifier polygons.",
    )
    @api.expect(sia_polygon_difference)
    @api.response(200, "Success", sia_polygon_operations_response)
    @api.response(400, "Bad Request", error_model)
    @api.response(403, "Forbidden", error_model)
    @api.response(500, "Internal Server Error", error_model)
    @jwt_required()
    def post(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = int(get_jwt_identity())
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return api.abort(403, "You need to be {} in order to perform this request.".format(roles.ANNOTATOR))
        try:
            data = json.loads(request.data)
            flask.current_app.logger.info(f"Received payload for difference: {data}")

            data = sia.normalize_annotations({
                "annotations": [data["selectedPolygon"]] + data.get("polygonModifiers", [])
            })
            data["selectedPolygon"] = data["annotations"][0]["polygonCoordinates"]
            data["polygonModifiers"] = [ann["polygonCoordinates"] for ann in data["annotations"][1:]]

            response = sia.perform_polygon_difference(data)
            dbm.close_session()
            return response, 200
        except sia.PolygonOperationError as e:
            flask.current_app.logger.error(f"Validation error in polygon difference: {str(e)}")
            dbm.close_session()
            return {"error": str(e)}, 400
        except TopologicalError as e:
            flask.current_app.logger.error(f"Topology error in polygon difference: {str(e)}")
            dbm.close_session()
            return {"error": str(e)}, 400
        except Exception as e:
            flask.current_app.logger.error(f"Unexpected error in polygon difference: {str(e)}")
            dbm.close_session()
            return {"error": str(e)}, 500


@namespace.route("/bboxFromPoints")
@api.doc(security="apikey")
class BBoxFromPoints(Resource):
    @api.doc(security="apikey", description="Compute tightest bounding boxes from multiple point sets.")
    @api.expect(sia_bbox_from_points)
    @api.response(200, "Success", sia_bbox_from_points_response)
    @api.response(400, "Bad Request", error_model)
    @api.response(403, "Forbidden", error_model)
    @api.response(500, "Internal Server Error", error_model)
    @jwt_required()
    def post(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = int(get_jwt_identity())
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return api.abort(403, f"You need to be {roles.ANNOTATOR} in order to perform this request.")
        try:
            data = json.loads(request.data)
            flask.current_app.logger.info(f"Received payload for bounding box computation: {data}")

            response = sia.compute_bboxes_from_points(data)

            dbm.close_session()
            return {"data": response}, 200
        except sia.PolygonOperationError as e:
            flask.current_app.logger.error(f"Validation error in bounding box computation: {str(e)}")
            dbm.close_session()
            return {"error": str(e)}, 400
        except Exception as e:
            flask.current_app.logger.error(f"Unexpected error in bounding box computation: {str(e)}")
            dbm.close_session()
            return {"error": str(e)}, 500
