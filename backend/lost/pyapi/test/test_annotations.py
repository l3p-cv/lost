
class TestTwoDAnnos(object):

    def test_get_anno_vec(self, simple_bbox_anno):
        vec = simple_bbox_anno.get_anno_vec()
        print(vec)
        assert vec[0] == 0.1
        assert vec[1] == 0.1
        assert vec[2] == 0.2
        assert vec[3] == 0.2
        assert False