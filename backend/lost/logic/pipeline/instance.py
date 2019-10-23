import lost
from lost.db import dtype
from lost.logic.file_man import FileMan

class PipeInstance(object):
    '''Model a Pipeline instance within LOST.
    '''
    def __init__(self, dbm, pipe):
        self.pipe = pipe #type: lost.db.model.Pipe
        self.dbm = dbm #type: lost.db.access.DBMan
        self.fm = FileMan(self.dbm.lostconfig)

    def _delete_result_links(self, pe):
        for result_link in self.dbm.get_resultlinks_pe_n(pe_n_id=pe.idx):
            self.dbm.delete(result_link)
        self.dbm.commit()

    def _delete_results(self, pe):
        '''Delete results of pe and all related data.

        Args:
            pe (:class:`lost.db.model.PipeElement`): PipeElement where 
                results should be deleted for.
        
        Note:
            Only scripts contain their own Results
            for all other elements results are just 
            just looped through from Scripts. 
        '''
        pe = pe #type: lost.db.model.PipeElement
        #Only scripts contain their own Results
        #all other elements just loop through results from Scripts. 
        if pe.dtype == dtype.PipeElement.SCRIPT:
            for res in pe.result_out: 
                #Delete annotations
                for img_anno in res.img_annos:
                    for twod_anno in img_anno.twod_annos:
                        self.dbm.delete(twod_anno.labels)
                        self.dbm.delete(twod_anno)
                    self.dbm.delete(img_anno)
                #Delete visual outputs
                for vis_out in res.visual_outputs:
                    self.dbm.delete(vis_out)
                #Delete data exports
                for de in res.data_exports:
                    self.dbm.delete(de)
                self.dbm.delete(res)
            self.dbm.commit()

    def delete_pipeline(self):
        '''Delete this pipeline instance from LOST'''
        for pe in self.pipe.pe_list:
            self._delete_result_links(pe)
        for pe in self.pipe.pe_list:
            self._delete_results(pe)
        for pe in self.pipe.pe_list:
            self._delete_pe(pe)
        self.fm.rm_pipe_log_path(self.pipe)
        self.fm.rm_pipe_context_path(self.pipe)
        self.dbm.delete(self.pipe)
        self.dbm.commit()

    def _delete_pe(self, pe):
        '''Delete a PipeElement of this pipeline
        
        Args:
            pe (:class:`lost.db.model.PipeElement`): The pipeline element
                to delete.
        ''' 
        pe = pe #type: lost.db.model.PipeElement
        if pe.dtype == dtype.PipeElement.SCRIPT:
            self.dbm.delete(pe.script)
            self.fm.rm_instance_path(pe)
        elif pe.dtype == dtype.PipeElement.ANNO_TASK:
            for req_leaf in pe.anno_task.req_label_leaves:
                self.dbm.delete(req_leaf)
            self.dbm.delete(pe.anno_task)
            self.dbm.commit()
        elif pe.dtype == dtype.PipeElement.DATASOURCE:
            self.dbm.delete(pe.datasource)
        elif pe.dtype == dtype.PipeElement.LOOP:
            self.dbm.delete(pe.loop)
        elif pe.dtype == dtype.PipeElement.DATA_EXPORT:
            pass
        elif pe.dtype == dtype.PipeElement.VISUALIZATION:
            pass
        else:
            raise Exception('Unknown dtype for PipeElement!')
        self.dbm.delete(pe)
        self.dbm.commit()

    