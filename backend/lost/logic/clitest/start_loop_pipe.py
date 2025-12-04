import json

from lost.logic.pipeline import service as pipeline
from lost.logic.util.testdata_factory import Factory


def start_loop_parallel_pipe():
    with Factory() as factory:
        user_meta = factory.create_test_user_one()
        label_leaf_id = factory.create_label_leaf_one(user_meta.idx)
        dataset = factory.create_dataset_one(user_meta.idx)
        template_id = factory.create_loop_parallel()
        simulated_data = json.dumps({
            "templateId": template_id,
            "name": "myCoolTestPipe",
            "description": "descriptionOfMyCoolTestPipe",
            "isDebug": False,
            "elements": [
                {"peN": 1, "script": {"isDebug": False, "arguments": {"argumentName": "fromData"}}},
                {"peN": 2, "script": {"isDebug": False, "arguments": {"argumentName": "fromData"}}},
                {"peN": 3, "script": {"isDebug": False, "arguments": {"argumentName": "fromData"}}},
                {"peN": 4, "script": {"isDebug": False, "arguments": {"argumentName": "fromData"}}},
            ],
        })
        pipe_id = pipeline.start(factory.db_man, simulated_data, user_meta.idx)
        print("Pipeline started. ID: " + str(pipe_id))


if __name__ == "__main__":
    start_loop_parallel_pipe()
