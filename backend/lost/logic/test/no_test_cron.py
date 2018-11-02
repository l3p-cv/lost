from lost.db import model, access, dtype
from lost.logic.config import LOSTConfig
from lost.logic.pipeline import service as pipeline
from lost.logic.pipeline import cron
from lost.logic.util import testils
from lost.logic.util.testdata_factory import Factory
import json
from datetime import datetime
import numpy as np
import pudb


class TestCronWithSiaPipe(object):
    def test_cron_with_sia_pipe(self):
        test_session = testils.TestSession("test_cron_with_sia_pipe")
        db_man = test_session.db_man
        with Factory(db_man=db_man, forTest=True) as factory:
            user_meta = factory.create_test_user_one()
            label_leaf_id = factory.create_label_leaf_one(user_meta.idx)
            dataset = factory.create_dataset_one(user_meta.idx)
            template_id = factory.create_sia_preboxed()
        simulated_pipe_data = json.dumps({
            "templateId": template_id,
            "name": "myCoolTestPipe",
            "description": "descriptionOfMyCoolTestPipe",
            "isDebug": False,
            "elements": [
                {
                    "peN": 0,
                    "datasource": {
                        "datasetId": dataset.idx
                    }
                },
                {
                    "peN": 1,
                    "script": {
                        "isDebug": False,
                        "arguments": {
                            "argumentName" :"fromData"
                        }
                    }
                },
                {
                    "peN": 2,
                    "annoTask": {
                        "name": "AnnoTaskNameFromData",
                        "instructions": "doSomethingFromData",
                        "workerId": user_meta.idx,
                        "labelLeaves": [
                            {
                                "id": label_leaf_id,
                                "maxLabels": 3
                            }
                        ]
                    }
                },
                {
                    "peN": 3,
                    "script": {
                        "isDebug": False,
                    }
                },
            ]
        })
        pipe_id = pipeline.start(db_man, simulated_pipe_data, user_meta.idx)
       # run cron
        pipes = db_man.get_pipes_to_process()
       # For each pipe in this project
        for pipe in pipes:
           pipe_man = cron.PipeMan(dbm=db_man, pipe=pipe, lostconfig=test_session.lostconfig)
           # remove the following line to prevent pudb start
           pudb.set_trace()
           pipe_man.process_pipeline()
           pipe_man.process_pipeline()
        assert False
        test_session.close()


def sia_with_real_pipe():

        pass
