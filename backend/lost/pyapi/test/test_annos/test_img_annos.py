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

@pytest.fixture
def full_img_anno():
    dbm = DBMan(config.LOSTConfig())
    test_user = testils.get_user(dbm)
    tree = testils.get_voc_label_tree(dbm)
    label_vec = tree.get_child_vec(tree.root.idx)
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
    lbl = model.Label(label_leaf_id=label_vec[0])
    dbm.add(lbl)
    twod_anno.labels.append(lbl)
    twod_anno.annotator = test_user
    twod_anno2 = model.TwoDAnno(
        data=json.dumps(
            {
                'x':REF_POINT[0],
                'y':REF_POINT[1]
            }
        ),
        dtype=dtype.TwoDAnno.POINT
    )
    lbl = model.Label(label_leaf_id=label_vec[1])
    dbm.add(lbl)
    twod_anno2.labels.append(lbl)
    twod_anno2.annotator = test_user
    line = model.TwoDAnno()
    lbl = model.Label(label_leaf_id=label_vec[4])
    line.labels.append(lbl)
    dbm.add(lbl)
    line.annotator = test_user
    line.line = REF_LINE
    img_anno = model.ImageAnno(img_path='path/to/img1.jpg')
    fs = add_local_fs(dbm, 'local_fs_for_full_img_anno')
    img_anno.fs_id = fs.idx
    lbl = model.Label(label_leaf_id=label_vec[3])
    dbm.add(lbl)
    img_anno.labels.append(lbl)
    dbm.commit()
    img_anno.twod_annos.append(twod_anno)
    img_anno.twod_annos.append(twod_anno2)
    img_anno.twod_annos.append(line)
    # dbm.add(img_anno.labels)
    dbm.add(img_anno)
    # dbm.add(twod_anno)
    dbm.commit()
    yield img_anno
    # dbm.delete(twod_anno.labels)
    dbm.delete(twod_anno)
    # dbm.delete(twod_anno2.labels)
    dbm.delete(twod_anno2)
    # dbm.delete(img_anno.labels)
    dbm.delete(img_anno)
    dbm.commit()
    delete_local_fs(dbm, fs)

@pytest.fixture
def empty_img_anno():
    dbm = DBMan(config.LOSTConfig())
    img_anno = model.ImageAnno(img_path='path/to/img1.jpg')
    fs = add_local_fs(dbm, 'local_fs_for_empty_img_anno')
    img_anno.fs_id = fs.idx
    dbm.add(img_anno)
    dbm.commit()
    yield img_anno
    dbm.delete(img_anno)
    dbm.commit()
    delete_local_fs(dbm, fs)

def add_local_fs(dbm, fs_name):
    test_user = testils.get_user(dbm)
    fs = model.FileSystem(group_id=test_user.groups[0].idx, connection=json.dumps(dict()), root_path='',
                fs_type='file', timestamp=datetime.datetime.now(), name=fs_name)
    dbm.add(fs)
    dbm.commit()
    return fs

def delete_local_fs(dbm, fs):
    dbm.delete(fs)
    dbm.commit()
class TestImageAnnos(object):
    
    def test_to_dict_flat(self, full_img_anno):
        print('full_img_anno.to_dict()', full_img_anno.to_dict()[1])
        my_dict = full_img_anno.to_dict()[1]
        bbox = full_img_anno.twod_annos[0]
        print('bbox.data', type(bbox.data))
        print('flat_dict', type(my_dict['anno_data']))
        assert my_dict['anno_data'] == bbox.get_anno_serialization_format()#bbox.data
        assert my_dict['anno_lbl'][0] == bbox.labels[0].label_leaf.name
        assert my_dict['img_path'] == full_img_anno.img_path
        # print(full_img_anno.to_dict()[0].keys())
        # for d in full_img_anno.to_dict():
        #      print(d['img.img_path'], d['anno.lbl.name'], d['anno.dtype'])
        # assert False

    def test_to_dict_hierarchical(self, full_img_anno):
        img_dict = full_img_anno.to_dict(style='hierarchical')
        bbox = full_img_anno.twod_annos[0]
        bbox_dict = img_dict['img_2d_annos'][0]
        print(img_dict)
        assert bbox_dict['anno_lbl'][0] == bbox.labels[0].label_leaf.name
        assert bbox_dict['anno_data'][0][0] == REF_BBOX[0]
        assert bbox_dict['anno_data'][0][1] == REF_BBOX[1]
        assert bbox_dict['anno_data'][0][2] == REF_BBOX[2]
        assert bbox_dict['anno_data'][0][3] == REF_BBOX[3]
        assert img_dict['img_path'] == full_img_anno.img_path
        
        # h_dict = full_img_anno.to_dict(style='hierarchical')
        # print(h_dict.keys())
        # print(h_dict['img.twod_annos'][0].keys())
        # for d in h_dict['img.twod_annos']:
        #     print(h_dict['img.img_path'], d['anno.lbl.name'], d['anno.dtype'])
        # assert False

    def test_to_vec(self, full_img_anno):
        img_anno = full_img_anno
        bbox = full_img_anno.twod_annos[0]
        print('img_anno.to_vec()', img_anno.to_vec())
        assert check_bbox(REF_BBOX, img_anno.to_vec('anno_data')[1][0])
        # print(img_anno.to_vec(['img.lbl.name','img.lbl.idx']))
        # print(img_anno.to_df()[['img.lbl.name','img.lbl.idx']])
        # print(img_anno.to_df().info())
        print(img_anno.to_vec())
        vec = img_anno.to_vec(['anno_lbl'])[1]
        print(vec)
        assert vec[0][0] == bbox.labels[0].label_leaf.name
        # assert json.loads(vec[1])[0] == bbox.labels[0].label_leaf.idx
        # assert vec[2][0] == bbox.labels[0].label_leaf.external_id

        vec = img_anno.to_vec(['img_lbl', 'img_path'])[1]
        assert vec[0][0] == img_anno.labels[0].label_leaf.name
        assert vec[1] == img_anno.img_path

        # print(img_anno.to_vec('anno.lbl.name'))
        # print(img_anno.to_vec(['img.img_path', 'anno.lbl.name', 'anno.data', 'anno.dtype']))
        # assert False
        
    def test_to_vec_empty_image(self, empty_img_anno):
        img_anno = empty_img_anno

        vec = img_anno.to_vec(['anno_lbl'])[0]
        print(vec)
        assert len(vec[0]) == 0

        vec2 = img_anno.to_vec(['img_lbl', 'img_path'])[0]
        print(vec2)
        assert len(vec2[0]) == 0
        assert vec2[1] == img_anno.img_path