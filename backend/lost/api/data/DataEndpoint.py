"""Data namespace — FastAPI endpoints for data access.
Routes:
    GET /api/data/export/{deid}       — get data export as blob (designer)
    GET /api/data/image/{image_id}    — get image as base64 string (annotator)
    GET /api/data/storeKeys           — get datastore keys (jwt)
"""
from __future__ import annotations

import base64
import logging

import cv2
import lost_ds as lds
from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response, PlainTextResponse, JSONResponse

from lost.api.auth.dependencies import get_current_user, require_role
from lost.api.base import ProfilingRoute
from lost.db import roles
from lost.db.access import DBMan
from lost.db.model import User as DBUser
from lost.db.session import get_db
from lost.logic import dask_session
from lost.logic.file_access import UserFileAccess
from lost.logic.file_man import FileMan
from lost.settings import LOST_CONFIG

logger = logging.getLogger("lost.api.data")
router = APIRouter(tags=["data"], route_class=ProfilingRoute)


def _load_img(db_img, ufa, user):
    """Load an annotation image, handling dynamic vs static worker management."""
    if LOST_CONFIG.worker_management != "dynamic":
        try:
            ufa.fs.ls(db_img.img_path)
        except Exception:
            pass
        img = ufa.load_anno_img(db_img)
    else:
        img = dask_session.ds_man.read_fs_img(user, db_img.fs, db_img.img_path)
    return img


@router.get("/export/{deid}")
def get_data_export(
    deid: int,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Get the data export for the given export id as a blob."""
    de = dbm.get_data_export(deid)
    fs_db = de.fs
    fm = FileMan(fs_db=fs_db)
    with fm.fs.open(de.file_path, "rb") as f:
        return Response(
            content=f.read(),
            media_type="blob",
            headers={"Content-Disposition": "attachment; filename=annos.parquet"},
        )


@router.get("/image/{image_id}")
def get_image(
    image_id: int,
    type: str = Query(..., description='Type of the mia image: "imageBased" or "annoBased"'),
    context: float = Query(0.0, description="Context Size"),
    drawAnno: bool = Query(False, description="Whether anno should be drawn"),
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Get the image with the given ID as a base64 encoded BLOB.
    Returns a plain text string (not JSON) to match Flask behavior:
    "data:img/jpg;base64,<base64_string>"
    """
    if type == "imageBased":
        db_img = dbm.get_image_anno(image_id)
        ufa = UserFileAccess(dbm, user, db_img.fs)
        img = _load_img(db_img, ufa, user)
    elif type == "annoBased":
        db_anno = dbm.get_two_d_anno(two_d_anno_id=image_id)
        db_img = dbm.get_image_anno(db_anno.img_anno_id)
        ufa = UserFileAccess(dbm, user, db_img.fs)
        image = _load_img(db_img, ufa, user)
        img_h = image.shape[0]
        img_w = image.shape[1]
        df = db_img.to_df()
        df = df[df["anno_uid"] == db_anno.idx]
        ds = lds.LOSTDataset(df, filesystem=ufa.fs)
        if drawAnno:
            img = lds.vis_sample(image, ds.df, lbl_col=None, line_thickness=1)
        else:
            img = image
        anno = ds.df["anno_data"].iloc[0]
        anno = anno * [img_w, img_h]
        my_min = anno.min(axis=0).astype(int)
        my_max = anno.max(axis=0).astype(int)
        if context == 0:
            img = img[my_min[1] : my_max[1], my_min[0] : my_max[0]]
        else:
            anno_w = my_max[0] - my_min[0]
            anno_h = my_max[1] - my_min[1]
            x_cont = int((anno_w) * context / 2)
            y_cont = int((anno_h) * context / 2)
            x_min = max(0, my_min[0] - x_cont)
            y_min = max(0, my_min[1] - y_cont)
            x_max = min(img_w, my_max[0] + x_cont)
            y_max = min(img_h, my_max[1] + y_cont)
            img = img[y_min:y_max, x_min:x_max]
    else:
        return PlainTextResponse("Unknown mia image type", status_code=422)
    _, data = cv2.imencode(".jpg", img)
    data64 = base64.b64encode(data.tobytes())
    return PlainTextResponse("data:img/jpg;base64," + data64.decode("utf-8"))


@router.get("/storeKeys")
def get_store_keys(
    user: DBUser = Depends(get_current_user),
):
    """Get the Datastores with their names."""
    return {"1": "Datastore 1", "2": "Datastore 2", "3": "Datastore 3", "4": "Datastore 4", "5": "Datastore 5"}