"""Data business layer — data export reading and image encoding.

No legacy lost/logic counterpart; logic was inline in the endpoint. Uses
shared utils that stay in logic/: dask_session, UserFileAccess, FileMan.
Cropping/visualization uses the external lost_ds package.
"""
from __future__ import annotations

import base64
import json

import cv2
import lost_ds as lds
import numpy as np

from lost.controllers.Exceptions import DomainError
from lost.db import dtype, model
from lost.logic import dask_session
from lost.logic.file_access import UserFileAccess
from lost.logic.file_man import FileMan
from lost.settings import LOST_CONFIG


class UnknownMiaImageTypeError(DomainError):
    """The mia image type is neither imageBased nor annoBased."""

_STORE_KEYS = {
    "1": "Datastore 1", "2": "Datastore 2", "3": "Datastore 3",
    "4": "Datastore 4", "5": "Datastore 5",
}


class DataBusiness:
    """Data business service — export reading and image encoding."""

    def __init__(self, dbm) -> None:
        self.dbm = dbm

    def _load_img(self, db_img, ufa, user):
        """Load an annotation image (dynamic vs static worker management)."""
        if LOST_CONFIG.worker_management != "dynamic":
            try:
                ufa.fs.ls(db_img.img_path)
            except Exception:
                pass
            return ufa.load_anno_img(db_img)
        return dask_session.ds_man.read_fs_img(user, db_img.fs, db_img.img_path)

    def _annotask_draw_anno(self, anno_task_id: int) -> bool:
        """Whether the annotask configuration requests drawn annotations."""
        annotask = self.dbm.get_anno_task(anno_task_id=anno_task_id)
        if annotask is None or not annotask.configuration:
            return False
        try:
            return bool(json.loads(annotask.configuration).get("drawAnno", False))
        except (TypeError, ValueError):
            return False

    def _annotask_add_context(self, anno_task_id: int) -> float:
        """addContext margin from the annotask configuration (0.0 if unset)."""
        annotask = self.dbm.get_anno_task(anno_task_id=anno_task_id)
        if annotask is None or not annotask.configuration:
            return 0.0
        try:
            return float(json.loads(annotask.configuration).get("addContext") or 0.0)
        except (TypeError, ValueError):
            return 0.0

    def read_export(self, deid: int) -> bytes:
        """Read the parquet export for *deid* as bytes."""
        de = self.dbm.get_data_export(deid)
        fs_db = de.fs
        fm = FileMan(fs_db=fs_db)
        with fm.fs.open(de.file_path, "rb") as f:
            return f.read()

    @staticmethod
    def _anno_crop_rect(anno: model.TwoDAnno, img_w: int, img_h: int) -> tuple[int, int, int, int]:
        """Absolute-pixel crop rect (x_min, y_min, x_max, y_max) for a rel-coords 2D anno.

        Falls back to the full image for unknown/null anno dtypes.
        """
        if anno.dtype == dtype.TwoDAnno.BBOX:
            xc, yc, w, h = anno.bbox
            return (
                int((xc - w / 2) * img_w),
                int((yc - h / 2) * img_h),
                int((xc + w / 2) * img_w),
                int((yc + h / 2) * img_h),
            )
        if anno.dtype == dtype.TwoDAnno.POINT:
            x, y = anno.point
            xi = int(x * img_w)
            yi = int(y * img_h)
            return xi, yi, xi, yi
        if anno.dtype in (dtype.TwoDAnno.LINE, dtype.TwoDAnno.POLYGON):
            data = np.asarray(anno.get_anno_serialization_format(), dtype=float) * [img_w, img_h]
            my_min = data.min(axis=0).astype(int)
            my_max = data.max(axis=0).astype(int)
            return int(my_min[0]), int(my_min[1]), int(my_max[0]), int(my_max[1])
        return 0, 0, img_w, img_h

    def image_b64(self, user, image_id: int, type: str, context: float, draw_anno: bool) -> str:
        """The requested image as a base64 data-URI string.

        Raises:
            UnknownMiaImageTypeError: neither imageBased nor annoBased.
        """
        if type == "imageBased":
            db_img = self.dbm.get_image_anno(image_id)
            ufa = UserFileAccess(self.dbm, user, db_img.fs)
            img = self._load_img(db_img, ufa, user)
        elif type == "annoBased":
            db_anno = self.dbm.get_two_d_anno(two_d_anno_id=image_id)
            db_img = self.dbm.get_image_anno(db_anno.img_anno_id)
            ufa = UserFileAccess(self.dbm, user, db_img.fs)
            image = self._load_img(db_img, ufa, user)
            img_h = image.shape[0]
            img_w = image.shape[1]
            context = context if context != 0 else self._annotask_add_context(db_anno.anno_task_id)
            draw_anno = draw_anno or self._annotask_draw_anno(db_anno.anno_task_id)
            if draw_anno:
                df = db_img.to_df()
                df = df[df["anno_uid"] == db_anno.idx]
                ds = lds.LOSTDataset(df, filesystem=ufa.fs)
                img = lds.vis_sample(image, ds.df, lbl_col=None, line_thickness=1, radius=max(4, img_h // 100))
            else:
                img = image
            x_min, y_min, x_max, y_max = self._anno_crop_rect(db_anno, img_w, img_h)
            x_min = max(0, x_min)
            y_min = max(0, y_min)
            x_max = min(img_w, x_max)
            y_max = min(img_h, y_max)
            if context != 0:
                x_cont = int(img_w * context / 2)
                y_cont = int(img_h * context / 2)
                x_min = max(0, x_min - x_cont)
                y_min = max(0, y_min - y_cont)
                x_max = min(img_w, x_max + x_cont)
                y_max = min(img_h, y_max + y_cont)
            if x_max <= x_min or y_max <= y_min:
                img = image
            else:
                img = img[y_min:y_max, x_min:x_max]
        else:
            raise UnknownMiaImageTypeError(type)
        _, data = cv2.imencode(".jpg", img)
        data64 = base64.b64encode(data.tobytes())
        return "data:img/jpg;base64," + data64.decode("utf-8")

    def store_keys(self) -> dict:
        """The datastore keys (static legacy contract)."""
        return _STORE_KEYS
