import pytest
from lost.db import model, dtype
from lost.db.access import DBMan
from lost.logic import config
import json

REF_BBOX = [0.1, 0.1, 0.2, 0.2]
REF_POINT = [0.1, 0.1]
REF_LINE = [[0.1,0.1],[0.2,0.2]]
REF_POLYGON = [[0.1,0.1],[0.2,0.1],[0.15,0.2]]

dbm = DBMan(config.LOSTConfig())

@pytest.fixture(scope='module')
def simple_bbox_anno():
    twod_anno = model.TwoDAnno(
        data=json.dumps(
            {
                'x':REF_BBOX[0],
                'y':REF_BBOX[1],
                'w':REF_BBOX[2],
                'h':REF_BBOX[3]
            }
        ),
        dtype=dtype.TwoDAnno.BBOX
    )
    dbm.add(twod_anno)
    dbm.commit()
    yield twod_anno
    dbm.delete(twod_anno)
    dbm.commit()

# @pytest.fixture(scope='module')
# def bbox_anno():
#     pass

class TestAnnos(object):

    def test_get_anno_vec(self, simple_bbox_anno):
        vec = simple_bbox_anno.get_anno_vec()
        print(vec)
        assert vec[0] == REF_BBOX[0]
        assert vec[1] == REF_BBOX[1]
        assert vec[2] == REF_BBOX[2]
        assert vec[3] == REF_BBOX[3]

    def test_bbox_property(self):
        bbox_anno = model.TwoDAnno()
        bbox_anno.bbox = REF_BBOX
        for i, ref in enumerate(REF_BBOX):
            print(i, bbox_anno.bbox[i])
            assert ref == bbox_anno.bbox[i]

    def test_point_property(self):
        anno = model.TwoDAnno()
        anno.point = REF_POINT
        for i, ref in enumerate(REF_POINT):
            print(i, anno.point[i])
            assert ref == anno.point[i]

    def test_line_property(self):
        anno = model.TwoDAnno()
        anno.line = REF_LINE
        print('REF_LINE', REF_LINE)
        print('Annotation', anno.line)
        for i, point in enumerate(REF_LINE):
            for j, ref in enumerate(point):
                assert ref == anno.line[i][j]

    def test_polygon_property(self):
        anno = model.TwoDAnno()
        anno.polygon = REF_POLYGON
        print('REF_POLYGON', REF_POLYGON)
        print('Annotation', anno.polygon)
        for i, point in enumerate(REF_POLYGON):
            for j, ref in enumerate(point):
                assert ref == anno.polygon[i][j]