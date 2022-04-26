import pytest
from lost.db import model, dtype
from lost.db.access import DBMan
import lostconfig as config
import json
import datetime
from lost.utils import testils
from lost.pyapi.script import Script
import shutil
import os
from os.path import join
# import pudb

REF_BBOXES = [
    [0.1, 0.1, 0.2, 0.2],
    [0.2, 0.2, 0.3, 0.15],
    [0.3, 0.3, 0.3, 0.15]
]

EXAMPLE_IMG_DIR = '/code/src/backend/lost/pyapi/examples/images/10_voc2012'
LOST_EXAMPLE_IMG_DIR = '/home/lost/data/test'

IMG_NAME1 = '2007_008547.jpg'
IMG_NAME2 = '2008_002123.jpg'

IMG_PATH1 = f'{LOST_EXAMPLE_IMG_DIR}/{IMG_NAME1}'
IMG_PATH2 = f'{LOST_EXAMPLE_IMG_DIR}/{IMG_NAME2}'
os.makedirs(LOST_EXAMPLE_IMG_DIR, exist_ok=True)
shutil.copyfile(join(EXAMPLE_IMG_DIR, IMG_NAME1), join(LOST_EXAMPLE_IMG_DIR, IMG_NAME1))
shutil.copyfile(join(EXAMPLE_IMG_DIR, IMG_NAME2), join(LOST_EXAMPLE_IMG_DIR, IMG_NAME2))

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
        # print('script_element.manager_id', script_element.manager_id)
        s = Script(pe_id=script_element.idx)
        fs = TempFSDummy(local_fs)
        # pudb.set_trace()
        lbl_vec = tree.get_child_vec(tree.root.idx)
        s.outp.request_annos(IMG_PATH1,
            img_labels=[lbl_vec[1]],
            annos=REF_BBOXES,
            anno_types=['bbox']*len(REF_BBOXES),
            anno_labels=[[lbl_vec[1]]]*len(REF_BBOXES)
            )
        s.outp.request_annos(IMG_PATH2,
            img_labels=[lbl_vec[2]],
            annos=[
                REF_BBOXES[0]
            ],
            anno_types=['bbox'],
            anno_labels=[
                [lbl_vec[2]]
            ]
            )
        df = s.outp.to_df()
        df1 = df[df['img_path']==IMG_PATH1]
        assert len(df1)-1 == len(REF_BBOXES)
        df2 = df[df['img_path']==IMG_PATH2]
        assert len(df2)-1 == 1

        assert df2['img_lbl'].values[0][0] == 'Bird'
        for img_anno in s.outp.img_annos:
            if img_anno.img_path == IMG_PATH2:
                bbox2 = img_anno.to_vec('anno_data')[1]
                assert check_bbox(REF_BBOXES[0], bbox2[0])