import json

from lost.logic.pipeline import service as pipeline
from lost.logic.util.testdata_factory import Factory


def start_sia_preboxed_pipe():
    with Factory() as factory:
        print("Starting SIA Preboxed Pipe")
        user_meta = factory.create_test_user_one()
        label_leaf_id = factory.create_label_leaf_one(user_meta.idx)
        dataset = factory.create_dataset_one(user_meta.idx)
        template_id = factory.create_sia_preboxed()
        simulated_data = json.dumps({
            "templateId": template_id,
            "name": "myCoolTestPipe",
            "description": "descriptionOfMyCoolTestPipe",
            "isDebug": False,
            "elements": [
                {"peN": 0, "datasource": {"datasetId": dataset.idx}},
                {"peN": 1, "script": {"isDebug": False, "arguments": {"argumentName": "fromData"}}},
                {
                    "peN": 2,
                    "annoTask": {
                        "name": "AnnoTaskNameFromData",
                        "instructions": "doSomethingFromData",
                        "workerId": user_meta.idx,
                        "labelLeaves": [{"id": label_leaf_id, "maxLabels": 3}],
                    },
                },
                {
                    "peN": 3,
                    "script": {
                        "isDebug": False,
                    },
                },
            ],
        })
        pipe_id = pipeline.start(factory.db_man, simulated_data, user_meta.idx)
    print("Pipeline started. ID: " + str(pipe_id))


if __name__ == "__main__":
    start_sia_preboxed_pipe()
