import pytest
from lost.db import model, dtype
from lost.db.access import DBMan
import lostconfig as config
import json
import datetime
from lost.utils import testils

REF_BBOX = [0.1, 0.1, 0.2, 0.2]
REF_POINT = [0.1, 0.1]
REF_LINE = [[0.1,0.1],[0.2,0.2]]
REF_POLYGON = [[0.1,0.1],[0.2,0.1],[0.15,0.2]]


def check_bbox(ref, to_check):
    '''Check if two boxes are equal'''
    for i, r in enumerate(ref):
        if r != to_check[i]:
            return False
    return True

def check_point(ref, to_check):
    '''Check if two points are equal'''
    for i, r in enumerate(ref):
        if r != to_check[i]:
            return False
    return True

def check_line(ref, to_check):
    '''Check if two lines are equal'''
    for i, point in enumerate(ref):
        for j, r in enumerate(point):
            if r != to_check[i][j]:
                return False
    return True

def check_polygon(ref, to_check):
    '''Check if two polygons are equal'''
    return check_line(ref, to_check)

@pytest.fixture(scope='module')
def simple_bbox_anno():
    dbm = DBMan(config.LOSTConfig())
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

@pytest.fixture
def full_bbox_anno():
    dbm = DBMan(config.LOSTConfig())
    test_user = testils.get_user(dbm)
    tree = testils.get_voc_label_tree(dbm)
    label_leaf_id = tree.get_child_vec(tree.root.idx)[0]
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
    lbl = model.Label(label_leaf_id=label_leaf_id)
    twod_anno.labels.append(lbl)
    twod_anno.annotator = test_user
    dbm.add(twod_anno)
    dbm.commit()
    yield twod_anno
    dbm.delete(twod_anno)
    dbm.commit()
    # testils.delete_user(dbm, test_user)


class TestTwoDAnnos(object):

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

    def test_get_anno_vec(self):
        img_anno = model.ImageAnno()
        anno = model.TwoDAnno()
        anno.bbox = REF_BBOX
        img_anno.twod_annos.append(anno)
        anno = model.TwoDAnno()
        anno.point = REF_POINT
        img_anno.twod_annos.append(anno)
        anno = model.TwoDAnno()
        anno.line = REF_LINE
        img_anno.twod_annos.append(anno)
        anno = model.TwoDAnno()
        anno.polygon = REF_POLYGON
        img_anno.twod_annos.append(anno)

        print('Check BBox')
        bb_list = img_anno.get_anno_vec(anno_type='bbox')
        assert check_bbox(REF_BBOX, bb_list[0])
        
        print('Check Point')
        point_list = img_anno.get_anno_vec(anno_type='point')
        assert check_point(REF_POINT, point_list[0])        

        print('Check Line')
        line_list = img_anno.get_anno_vec(anno_type='line')
        line = line_list[0]
        check_line(REF_LINE, line)
        
        print('Check Polygon')
        polygon_list = img_anno.get_anno_vec(anno_type='polygon')
        check_polygon(REF_POLYGON, polygon_list[0])
    
    def test_to_dict_flat(self, full_bbox_anno):
        bbox = full_bbox_anno
        my_dict = bbox.to_dict()
        assert my_dict['anno_data'] == bbox.get_anno_serialization_format()
        assert my_dict['anno_lbl'][0] == bbox.labels[0].label_leaf.name

    def test_to_dict_hierarchical(self, full_bbox_anno):
        bbox = full_bbox_anno
        my_dict = bbox.to_dict(style='hierarchical')
        assert my_dict['anno_lbl'][0] == bbox.labels[0].label_leaf.name
        assert my_dict['anno_data'][0][0] == REF_BBOX[0]
        assert my_dict['anno_data'][0][1] == REF_BBOX[1]
        assert my_dict['anno_data'][0][2] == REF_BBOX[2]
        assert my_dict['anno_data'][0][3] == REF_BBOX[3]
        
    def test_to_df(self, full_bbox_anno):
        bbox = full_bbox_anno
        df = bbox.to_df()
        assert df['anno_data'].values[0] == bbox.get_anno_serialization_format()[0]
        assert df['anno_lbl'].values[0] == bbox.labels[0].label_leaf.name

    def test_to_vec(self, full_bbox_anno):
        bbox = full_bbox_anno
        assert check_bbox(REF_BBOX, bbox.to_vec('anno_data'))
        assert bbox.to_vec('anno_lbl') == full_bbox_anno.labels[0].label_leaf.name