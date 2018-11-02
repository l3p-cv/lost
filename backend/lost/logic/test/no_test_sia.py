from lost.db import model, access, dtype
from lost.logic.config import LOSTConfig
from lost.logic import pipeline
from lost.logic.pipeline import cron
from lost.logic import sia
from lost.logic.util import testils
from lost.logic.util.testdata_factory import Factory
import json
from datetime import datetime
import numpy as np
import pudb


class TestGetNextPrevious(object):
    def test_get_next_previous(self):
        test_session = testils.TestSession("get_next_previous")
        db_man = test_session.db_man
        with Factory(db_man=db_man, forTest=True) as factory:
            user_meta = factory.create_test_user_one()
            label_leaf_id = factory.create_label_leaf_one(user_meta.idx)
            dataset = factory.create_dataset_one(user_meta.idx)
            factory.create_sia_pe()
            factory.create_sia_annotask(user_meta.idx)
            factory.create_sia_choosen_anno_task(user_meta.idx)
            factory.create_sia_required_label_leaf(label_leaf_id)
            split = dataset.splits[0]
            factory.create_sia_three_annos(split.idx)
            pudb.set_trace()
            real_sia = sia.get_next(db_man, -1, user_meta.idx, "media_url")





            assert False
        test_session.close()



        # # real_pipe = json.loads(pipeline.get_running_pipe(db_man, pipe_id, "media_url"))
        # # SIA testing loop
        # last_image_id = -1
        # real_sia = sia.get_next(db_man, last_image_id)
        # expected_sia = {}
        # sia_comparator = SiaComparator(real_sia, expected_sia)
        # sia_comparator.compare()

        # simulated_sia_data = {}
        # sia.update(db_man, simulated_sia_data)



        # sia.update(db_man, )
        # real_sia = sia.get_next(db_man, 1)
        # sia.comparator.real_sia = real_sia
        # sia_comparator.expected_sia = expected_sia
        # sia_comparator.compare()

def sia_with_real_pipe():
      #     template_id = factory.create_sia_preboxed()
        # simulated_pipe_data = json.dumps({
        #     "templateId": template_id,
        #     "name": "myCoolTestPipe",
        #     "description": "descriptionOfMyCoolTestPipe",
        #     "isDebug": False,
        #     "elements": [
        #         {
        #             "peN": 0,
        #             "datasource": {
        #                 "datasetId": dataset.idx
        #             }
        #         },
        #         {
        #             "peN": 1,
        #             "script": {
        #                 "isDebug": False,
        #                 "arguments": {
        #                     "argumentName" :"fromData"
        #                 }
        #             }
        #         },
        #         {
        #             "peN": 2,
        #             "annoTask": {
        #                 "name": "AnnoTaskNameFromData",
        #                 "instructions": "doSomethingFromData",
        #                 "workerId": user_meta.idx,
        #                 "labelLeaves": [
        #                     {
        #                         "id": label_leaf_id,
        #                         "maxLabels": 3
        #                     }
        #                 ]
        #             }
        #         },
        #         {
        #             "peN": 3,
        #             "script": {
        #                 "isDebug": False,
        #             }
        #         },
        #     ]
        # })
        #pipe_id = pipeline.start(db_man, simulated_pipe_data, user_meta.idx)
        #pipes = db_man.get_pipes_to_process()
        # For each task in this project
        #for pipe in pipes:
        #    pipe_man = cron.PipeMan(dbm=db_man, pipe=pipe, lostconfig=test_session.lostconfig)
        #    pudb.set_trace()
        #    pipe_man.process_pipeline()
        #    pipe_man.process_pipeline()
        #assert False
        pass
