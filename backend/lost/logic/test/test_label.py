import pytest
from lost.db import model, dtype
from lost.db.access import DBMan
import lostconfig as config
from lost.logic.label import LabelTree

ROOT_NAME = 'first tree'
ROOT_EXTERNAL_ID = '0'
CHILD_HORSE_NAME = 'horse'
CHILD_HORSE_EXTERNAL_ID = '1'
CHILD_COW_NAME = 'cow'
CHILD_COW_EXTERNAL_ID = '2'


@pytest.fixture
def tree():
    dbm = DBMan(config.LOSTConfig())
    tree = LabelTree(dbm)
    root_leaf = tree.create_root(ROOT_NAME, external_id=ROOT_EXTERNAL_ID)
    yield tree 
    tree.delete_tree()

@pytest.fixture
def tree_plus_childs():
    dbm = DBMan(config.LOSTConfig())
    tree = LabelTree(dbm)
    root_leaf = tree.create_root(ROOT_NAME, external_id=ROOT_EXTERNAL_ID)
    horse = tree.create_child(tree.root.idx, CHILD_HORSE_NAME, 
            external_id=CHILD_HORSE_EXTERNAL_ID)
    cow = tree.create_child(tree.root.idx, CHILD_COW_NAME, 
            external_id=CHILD_COW_EXTERNAL_ID)
    yield tree # type: lost.logic.label.LabelTree
    tree.delete_tree()

class TestLabelTree(object):
    def test_create_delete_tree(self):
        assert True
        return None
        dbm = DBMan(config.LOSTConfig())
        tree = LabelTree(dbm)
        root_leaf = tree.create_root(ROOT_NAME, external_id=ROOT_EXTERNAL_ID)
        assert root_leaf.name == ROOT_NAME
        assert root_leaf.external_id == ROOT_EXTERNAL_ID
        assert tree.tree[root_leaf.idx] == root_leaf
        tree.delete_tree()

    def test_create_child(self, tree):
        assert True
        return None
        horse = tree.create_child(tree.root.idx, CHILD_HORSE_NAME, 
            external_id=CHILD_HORSE_EXTERNAL_ID)
        assert horse.name == CHILD_HORSE_NAME
        assert horse.external_id == CHILD_HORSE_EXTERNAL_ID
        assert tree.tree[horse.idx] == horse

        cow = tree.create_child(tree.root.idx, CHILD_COW_NAME, 
            external_id=CHILD_COW_EXTERNAL_ID)
        assert cow.name == CHILD_COW_NAME
        assert cow.external_id == CHILD_COW_EXTERNAL_ID
        assert tree.tree[cow.idx] == cow

    def test_get_child_vec(self, tree_plus_childs):
        assert True
        return None
        t = tree_plus_childs
        id_vec = t.get_child_vec(t.root.idx, columns='external_id')
        assert CHILD_COW_EXTERNAL_ID in id_vec
        assert CHILD_HORSE_EXTERNAL_ID in id_vec

        vec = t.get_child_vec(t.root.idx, columns=['external_id', 'name'])
        print('vec', vec)
        for e in vec:
            if CHILD_COW_EXTERNAL_ID in e:
                assert e[0] == CHILD_COW_EXTERNAL_ID
                assert e[1] == CHILD_COW_NAME
            elif CHILD_HORSE_EXTERNAL_ID in e:
                assert e[0] == CHILD_HORSE_EXTERNAL_ID
                assert e[1] == CHILD_HORSE_NAME
            else:
                print('Either cow or horse need to be in e!!!')
                assert False

    def test_to_df(self, tree_plus_childs):
        assert True
        return None
        df = tree_plus_childs.to_df()
        name_list = df['name'].values.tolist()
        assert CHILD_COW_NAME in name_list
        assert CHILD_HORSE_NAME in name_list
        assert ROOT_NAME in name_list

    def test_import_df(self, tree_plus_childs):
        assert True
        return None
        df = tree_plus_childs.to_df()
        df2 = df.copy()
        root_idx = df2[df2['parent_leaf_id'].isnull()].index.values[0]
        no_root_idx = df2[~df2['parent_leaf_id'].isnull()].index
        df2.loc[root_idx, 'name'] = 'second tree'
        df2.loc[root_idx, 'idx'] = 0
        df2.loc[no_root_idx, 'parent_leaf_id'] = 0

        dbm = DBMan(config.LOSTConfig())
        tree2 = LabelTree(dbm)
        root_leaf = tree2.import_df(df2)
        if root_leaf is None:
            raise Exception('A label tree with name "{}" already exists. Clean your Test Database!'.format(df2.loc[root_idx, 'name']))
        for key, val in tree2.tree.items():
            print(val.to_df()[['idx', 'name', 'external_id', 'parent_leaf_id']])
        for ll in tree2.root.label_leaves:
            assert ll.name == CHILD_COW_NAME or ll.name == CHILD_HORSE_NAME
        tree2.delete_tree()