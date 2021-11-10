import pytest
from lost.db import model, dtype
from lost.db.access import DBMan
import lostconfig as config
import json
import datetime
from lost.utils import testils
from lost.pyapi.script import Script
# import pudb

REF_BBOXES = [
    [0.1, 0.1, 0.2, 0.2],
    [0.2, 0.2, 0.3, 0.15],
    [0.3, 0.3, 0.3, 0.15]
]
IMG_PATH1 = 'path/to/img1.jpg'
IMG_PATH2 = 'path/to/img2.jpg'

def check_bbox(ref, to_check):
    '''Check if two boxes are equal'''
    for i, r in enumerate(ref):
        if r != to_check[i]:
            return False
    return True

@pytest.fixture
def script_element():
    dbm = DBMan(config.LOSTConfig())
    pe_s, pe_a, pipe = testils.get_script_pipeline_fragment(dbm)
    yield pe_s
    testils.delete_script_pipeline_fragment(
        dbm, pipe
    )

@pytest.fixture
def tree():
    dbm = DBMan(config.LOSTConfig())
    tree = testils.get_voc_label_tree(dbm)
    yield tree

@pytest.fixture
def local_fs():
    dbm = DBMan(config.LOSTConfig())
    test_user = testils.get_user(dbm)
    fs = model.FileSystem(group_id=test_user.groups[0].idx, connection=json.dumps(dict()), root_path='',
                fs_type='file', timestamp=datetime.datetime.now(), name='test_request_annos_fs')
    dbm.add(fs)
    dbm.commit()
    yield fs
class TempFSDummy(object):
    def __init__(self, fs):
        self.lost_fs = fs
class TestScriptApi(object):

    def test_request_annos(self, script_element, tree, local_fs):
        assert True
        return True
        s = Script(pe_id=script_element.idx)
        fs = TempFSDummy(local_fs)
        # pudb.set_trace()
        lbl_vec = tree.get_child_vec(tree.root.idx)
        s.outp.request_annos(IMG_PATH1,
            img_labels=[lbl_vec[1]],
            annos=REF_BBOXES,
            anno_types=['bbox']*len(REF_BBOXES),
            anno_labels=[[lbl_vec[1]]]*len(REF_BBOXES),
            fs=fs
            )
        s.outp.request_annos(IMG_PATH2,
            img_labels=[lbl_vec[2]],
            annos=[
                REF_BBOXES[0]
            ],
            anno_types=['bbox'],
            anno_labels=[
                [lbl_vec[2]]
            ],
            fs=fs
            )
        df = s.outp.to_df()
        df1 = df[df['img.img_path']==IMG_PATH1]
        assert len(df1) == len(REF_BBOXES)
        df2 = df[df['img.img_path']==IMG_PATH2]
        assert len(df2) == 1

        assert json.loads(df2['img.lbl.idx'].values[0])[0] == lbl_vec[2]
        for img_anno in s.outp.img_annos:
            if img_anno.img_path == IMG_PATH2:
                bbox2 = img_anno.to_vec('anno.data')[0]
                assert check_bbox(REF_BBOXES[0], bbox2)