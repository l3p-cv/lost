"""Data business layer — data export reading and image encoding.

No legacy lost/logic counterpart; logic was inline in the endpoint. Uses
shared utils that stay in logic/: dask_session, UserFileAccess, FileMan.
Cropping/visualization uses the external lost_ds package.
"""
from __future__ import annotations

import base64

import cv2
import lost_ds as lds

from lost.controllers.Exceptions import DomainError
from lost.logic import dask_session
from lost.logic.file_access import UserFileAccess
from lost.logic.file_man import FileMan
from lost.settings import LOST_CONFIG


class UnknownMiaImageTypeError(DomainError):
    """The mia image type is neither imageBased nor annoBased."""

    http_status = 422
    http_body = "Unknown mia image type"
    http_media_type = "text/plain"


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

    def read_export(self, deid: int) -> bytes:
        """Read the parquet export for *deid* as bytes."""
        de = self.dbm.get_data_export(deid)
        fs_db = de.fs
        fm = FileMan(fs_db=fs_db)
        with fm.fs.open(de.file_path, "rb") as f:
            return f.read()

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
            df = db_img.to_df()
            df = df[df["anno_uid"] == db_anno.idx]
            ds = lds.LOSTDataset(df, filesystem=ufa.fs)
            if draw_anno:
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
            raise UnknownMiaImageTypeError(type)
        _, data = cv2.imencode(".jpg", img)
        data64 = base64.b64encode(data.tobytes())
        return "data:img/jpg;base64," + data64.decode("utf-8")

    def store_keys(self) -> dict:
        """The datastore keys (static legacy contract)."""
        return _STORE_KEYS