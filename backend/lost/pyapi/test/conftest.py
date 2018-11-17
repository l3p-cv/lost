import pytest
import lost.db
from lost.logic import config
import json

@pytest.fixture(scope='module')
def simple_bbox_anno():
    dbm = lost.db.access.DBMan(config.LOSTConfig())
    img_anno = lost.db.model.TwoDAnno(
        data=json.dumps({'x':0.1,'y':0.1,'w':0.2,'h':0.2}),
        dtype=lost.db.dtype.TwoDAnno.BBOX)
    dbm.add(img_anno)
    dbm.commit()
    yield img_anno
    dbm.delete(img_anno)
    dbm.commit()
