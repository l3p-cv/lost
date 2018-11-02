from lost.pyapi.pipe_element import Element

#TODO: Adjust property comments

class AnnoTask(Element):

    def __init__(self, pe, dbm):
        super().__init__(pe, dbm)
        self._anno_task = pe.anno_task #type: lost.db.model.AnnotationTask

    @property
    def req_categories(self):        
        '''Get required label categories for this MOATask.

        Returns:
            list: [[lbl_category_id, lbl_category_name], ..., [...]]
        '''
        lbl_cats = list()
        for req_cat in self._anno_task.req_label_leaves:
            lbl_cats.append([req_cat.label_leaf.idx,
                             req_cat.label_leaf.name])
        return lbl_cats

    @property
    def possible_labels(self):
        '''Get all possible labels for this annotation task

        Returns:
            list: [[lbl_id, lbl_name],...,[..]]
        '''
        lbl_list = list()
        req_categories = self._anno_task.req_label_leaves
        for category in req_categories:
            parent_leaf = category.label_leaf
            for leaf in parent_leaf.children:
                lbl_list.append([leaf.idx, leaf.name, leaf.leaf_id])
        return lbl_list

class MIATask(AnnoTask):
    def __init__(self, pe, dbm):
        super().__init__(pe, dbm)

class SIATask(AnnoTask):
    def __init__(self, pe, dbm):
        super().__init__(pe, dbm)
        
