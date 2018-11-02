from lost.db import model, access, dtype
from lost.logic.config import LOSTConfig
from lost.logic.pipeline import service as pipeline
from lost.logic.util import testils
from lost.logic.util.testdata_factory import Factory
import json 
from datetime import datetime
import numpy as np
import pudb
    
def create_simple_template(db_man, user_id):
    pipe_template = model.PipeTemplate()
    pipe_template.debug_mode = False
    pipe_template.timestamp = datetime.now()
    pipe_template.user_id = user_id
    template = {
        "name": "TestPipe",
        "description": "a simple test pipe",
        "author": "Test User",
        "elements": [
            {
                "peN": 0,
                "peOut": [1],
                "datasource": {
                    "type": "dataset",
                }
            },
            {
                "peN": 1,
                "peOut": [2],
                "script": {
                    "name": "TestScript",
                    "description": "a test script",
                    "path": "/path/to/testscript.py",
                    "language": "python3",
                    "arguments": {
                        "argumentName": "fromTemplate"
                    },
                    "executors": ["containerOne", "containerTwo"]
                }
            },
            {
                "peN": 2,
                "peOut": '',
                "annoTask": {
                    "name": "TestAnnoTask",
                    "type": "sia",
                    "instructions": "testme",
                    "configuration":{
                        "tools" : ["bbox", "polygon", "line", "point"],
                        "actions" : ["label", "draw", "delete", "edit"]
                    }
                }
            }
        ]
    }
    pipe_template.json_template = json.dumps(template)
    db_man.save_obj(pipe_template)
    return pipe_template.idx
def create_simple_script(db_man):
    script_arguments = json.dumps({
        "argumentName": "fromScript"
    })
    script = model.Script(name="TestScript",
                       arguments=script_arguments,
                       language=dtype.ScriptLanguage.PYTHON3,
                       description="mytestscript", executors="[one, two]")
    db_man.save_obj(script)
    return script
class TestStart(object):
    def test_simple_pipe(self):
        test_session = testils.TestSession("simple_pipe")
        db_man = test_session.db_man
        with Factory(db_man=db_man, forTest=True) as factory:
            user_meta = factory.create_test_user_one()
            template_id = create_simple_template(db_man, user_meta.idx)
            script = create_simple_script(db_man)
            label_leaf_id = factory.create_label_leaf_one(user_meta.idx)
            dataset = factory.create_dataset_one(user_meta.idx)        
        simulated_data = json.dumps({
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
                }
            ]
        })
        pipe_id = pipeline.start(db_man, simulated_data, user_meta.idx)
        real_pipe = pipeline.get_running_pipe(db_man, pipe_id, "media_url")
        expected_pipe = {
            "id": pipe_id,
            "name": "myCoolTestPipe",
            "description": "descriptionOfMyCoolTestPipe",
            "userName": "Test User",
            "templateId": template_id,
            "isDebug": False,
            "elements": [
                {
                    "peN": 1,
                    "peOut": [2],
                    "state": "pending",
                    "datasource":{
                        "type": "dataset",
                        "dataset": {
                            "id": dataset.idx,
                            "name": dataset.name,
                            "description": dataset.description
                        }
                    }
                },
                {
                    "peN": 2,
                    "peOut": [3],
                    "state": "pending",
                    "script": {
                        "id": script.idx,
                        "isDebug": False,
                        "name": script.name,
                        "description": script.description,
                        "language": "python3",
                        "arguments": {
                             "argumentName" :"fromData"
                        }
                    }
                },
                {
                    "peN": 3,
                    "peOut": "",
                    "state": "pending",
                    "annoTask": {
                        "name": "AnnoTaskNameFromData",
                        "type": "sia",
                        "instructions": "doSomethingFromData",
                        "userName": "Test User",
                        "configuration":{
                        "tools" : ["bbox", "polygon", "line", "point"],
                        "actions" : ["label", "draw", "delete", "edit"]
                        },
                        "labelLeaves": [
                            {
                            "id": label_leaf_id,
                            "name": "Animals"
                            }
                        ]

                    }
                }
            ]
        }
        pipe_comparator = PipeComparator(real_pipe, expected_pipe)
        pipe_comparator.compare_pipe()
        test_session.close()
class TestSIAPipe(object):
    def test_sia_preboxed_pipe(self):
        test_session = testils.TestSession("sia_preboxed_pipe")
        db_man = test_session.db_man
        with Factory(db_man=db_man, forTest=True) as factory:
            user_meta = factory.create_test_user_one()
            label_leaf_id = factory.create_label_leaf_one(user_meta.idx)
            dataset = factory.create_dataset_one(user_meta.idx)
            pudb.set_trace()
            template_id = factory.create_sia_preboxed()
        simulated_data = json.dumps({
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
        pipe_id = pipeline.start(db_man, simulated_data, user_meta.idx)
        real_pipe = pipeline.get_running_pipe(db_man, pipe_id, "media_url")
        expected_pipe = {
            "id": pipe_id,
            "name": "myCoolTestPipe",
            "description": "descriptionOfMyCoolTestPipe",
            "userName": "Test User",
            "templateId": template_id,
            "isDebug": False,
            "elements": [
                {
                    "peN": 1,
                    "peOut": [2],
                    "state": "pending",
                    "datasource":{
                        "type": "dataset",
                        "dataset": {
                            "id": dataset.idx,
                            "name": dataset.name,
                            "description": dataset.description
                        }
                    }
                },
                {
                    "peN": 2,
                    "peOut": [3],
                    "state": "pending",
                    "script": {
                        "isDebug": False,
                        "name":"RequestBBAPreboxed",
                        "description": "Request BBoxAnnotations for all images in an imageset. Create also some dummy boxes.",
                        "language": "python3",
                    }
                },
                {
                    "peN": 3,
                    "peOut": [4],
                    "state": "pending",
                    "annoTask": {
                        "name": "AnnoTaskNameFromData",
                        "type": "sia",
                        "instructions": "doSomethingFromData",
                        "userName": "Test User",
                        "labelLeaves": [
                            {
                            "id": label_leaf_id,
                            "name": "Animals"
                            }
                        ]

                    }
                },
                {
                    "peN": 4,
                    "peOut": [5],
                    "state": "pending",
                    "script": {
                        "isDebug": False,
                        "name":"ExportBBoxJson",
                        "description": "Export all BBoxAnnotations to a json file.",
                        "language": "python3",
                    }
                },
                {
                    "peN": 5,
                    "peOut": "",
                    "state": "pending",
                    "dataExport":{
                    }
                }
            ]
        }
        pipe_comparator = PipeComparator(real_pipe, expected_pipe)
        pipe_comparator.compare_pipe()
        test_session.close()
class TestLoopPipe(object):
    def test_loop_parallel_pipe(self):
        test_session = testils.TestSession("loop_parallel_pipe")
        db_man = test_session.db_man
        with Factory(db_man=db_man, forTest=True) as factory:
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
                    "script": {
                        "isDebug": False,
                        "arguments": {
                            "argumentName" :"fromData"
                        }
                    }
                },
                {
                    "peN": 3,
                    "script": {
                        "isDebug": False,
                        "arguments": {
                            "argumentName" :"fromData"
                        }
                    }
                },
                {
                    "peN": 4,
                    "script": {
                        "isDebug": False,
                        "arguments": {
                            "argumentName" :"fromData"
                        }
                    }
                }
            ]
        })
        pipe_id = pipeline.start(db_man, simulated_data, user_meta.idx)
        real_pipe = pipeline.get_running_pipe(db_man, pipe_id, "media_url")
        expected_pipe = {
            "id": pipe_id,
            "name": "myCoolTestPipe",
            "description": "descriptionOfMyCoolTestPipe",
            "userName": "Test User",
            "templateId": template_id,
            "isDebug": False,
            "elements": [
                {
                    "peN": 1,
                    "peOut": [2,4],
                    "state": "pending",
                    "script": {
                        "isDebug": False,
                        "name":"IterationTxt",
                        "description": "Save the current iteration to a file",
                        "language": "python3",
                    }
                },
                {
                    "peN": 2,
                    "peOut": [3],
                    "state": "pending",
                    "script": {
                        "isDebug": False,
                        "name":"IterationTxt",
                        "description": "Save the current iteration to a file",
                        "language": "python3",
                    }
                },
                {
                    "peN": 3,
                    "peOut": [5],
                    "state": "pending",
                    "script": {
                        "isDebug": False,
                        "name":"IterationTxt",
                        "description": "Save the current iteration to a file",
                        "language": "python3",
                    }
                },
                {
                    "peN": 4,
                    "peOut": [5],
                    "state": "pending",
                    "script": {
                        "isDebug": False,
                        "name":"IterationTxt",
                        "description": "Save the current iteration to a file",
                        "language": "python3",
                    }
                },
                {
                    "peN": 5,
                    "peOut": "",
                    "state": "pending",
                    "loop":{
                        "maxIteration": 3,
                        "peJumpId": 1 ,
                        "iteration": 0,
                        "isBreakLoop": False 
                    }
                }
            ]
        }
        pipe_comparator = PipeComparator(real_pipe, expected_pipe)
        pipe_comparator.compare_pipe()
        test_session.close()
class TestParallelTestPipe(object):
    def test_parallel_test_pipe(self):
        test_session = testils.TestSession("parallel_test_pipe")
        db_man = test_session.db_man
        with Factory(db_man=db_man, forTest=True) as factory:
            user_meta = factory.create_test_user_one()
            label_leaf_id = factory.create_label_leaf_one(user_meta.idx)
            dataset = factory.create_dataset_one(user_meta.idx)
            template_id = factory.create_parallel_test()
        simulated_data = json.dumps({
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
                        "arguments": {
                            "argumentName" :"fromData"
                        }
                    }
                },
                {
                    "peN": 5,
                    "script": {
                        "isDebug": False,
                        "arguments": {
                            "argumentName" :"fromData"
                        }
                    }
                }
            ]
        })
        pipe_id = pipeline.start(db_man, simulated_data, user_meta.idx)
        real_pipe = pipeline.get_running_pipe(db_man, pipe_id, "media_url")
        expected_pipe = {
            "id": pipe_id,
            "name": "myCoolTestPipe",
            "description": "descriptionOfMyCoolTestPipe",
            "userName": "Test User",
            "templateId": template_id,
            "isDebug": False,
            "elements": [
              {
                    "peN": 1,
                    "peOut": [2],
                    "state": "pending",
                    "datasource":{
                        "type": "dataset",
                        "dataset": {
                            "id": dataset.idx,
                            "name": dataset.name,
                            "description": dataset.description
                        }
                    }
                },
                {
                    "peN": 2,
                    "peOut": [3],
                    "state": "pending",
                    "script": {
                        "isDebug": False,
                        "name": "AnnoAllImgs",
                        "description": "Request ImageAnnotations for all images in an imageset",
                        "language": "python3",
                    }
                },
                {
                    "peN": 3,
                    "peOut": [4, 6],
                    "state": "pending",
                    "annoTask": {
                        "name": "AnnoTaskNameFromData",
                        "type": "mia",
                        "instructions": "doSomethingFromData",
                        "userName": "Test User",
                        "configuration":{
                        "tools" : ["bbox", "polygon", "line", "point"],
                        "actions" : ["label", "draw", "delete", "edit"]
                        },
                        "labelLeaves": [
                            {
                            "id": label_leaf_id,
                            "name": "Animals"
                            }
                        ]

                    }
                },
                 {
                    "peN": 4,
                    "peOut": [5],
                    "state": "pending",
                    "script": {
                        "isDebug": False,
                        "name": "VisAnnosPerLabel",
                        "description": "Create a VisualOutput that shows the number of MOA_IMG annotations per label",
                        "language": "python3",
                    }
                },
                 {
                    "peN": 5,
                    "peOut": "",
                    "state": "pending",
                    "visualOutput":{
                    }
                },
                  {
                    "peN": 6,
                    "peOut": [7],
                    "state": "pending",
                    "script": {
                        "isDebug": False,
                        "name": "Export CSV",
                        "description": "Export annotations to a csv file.",
                        "language": "python3",
                    }
                },
                  {
                    "peN": 7,
                    "peOut": "",
                    "state": "pending",
                    "dataExport":{
                    }
                }
            ]
        }
        pipe_comparator = PipeComparator(real_pipe, expected_pipe)
        pipe_comparator.compare_pipe()
        test_session.close()
class PipeComparator(object):
    def __init__(self, real_pipe, expected_pipe):
        self.real_pipe = real_pipe
        self.expected_pipe = expected_pipe
    def compare_pipe(self):
        assert self.real_pipe['id'] == self.expected_pipe['id']
        assert self.real_pipe['name'] == self.expected_pipe['name']
        assert self.real_pipe['description'] == self.expected_pipe['description']
        assert self.real_pipe['templateId'] == self.expected_pipe['templateId']
        assert self.real_pipe['userName'] == self.expected_pipe['userName']
        assert self.real_pipe['isDebug'] == self.expected_pipe['isDebug']
        
        for expected_element in self.expected_pipe['elements']:
            real_element = list(filter(lambda x: x['peN'] == expected_element['peN'], 
                self.real_pipe['elements']))[0]
            # Check for multiple entrys of the same element
            counts = np.unique(real_element['peOut'], return_counts=True)[1] - 1
            assert np.count_nonzero(counts) == 0
            # Check if all expected elements are contained in real_element
            if len(expected_element['peOut']) > 0:
                assert np.setxor1d(expected_element['peOut'], 
                                    real_element['peOut']).size == 0
            else:
                assert len(expected_element['peOut']) == len(real_element['peOut'])
            expected_element['state'] == real_element['state']
            if 'datasource' in expected_element:
                assert expected_element['datasource']['type'] == real_element['datasource']['type']
                assert expected_element['datasource']['dataset']['id'] == \
                real_element['datasource']['dataset']['id']
                assert expected_element['datasource']['dataset']['name'] == \
                real_element['datasource']['dataset']['name']
                assert expected_element['datasource']['dataset']['description'] == \
                real_element['datasource']['dataset']['description']
            elif 'script' in expected_element:
                if 'id' in expected_element['script']:
                    assert expected_element['script']['id'] == real_element['script']['id']
                assert expected_element['script']['name'] == real_element['script']['name']
                assert expected_element['script']['description'] == real_element['script']['description']
                assert expected_element['script']['language'] == real_element['script']['language']
                if 'arguments' in expected_element['script']:
                    if 'argumentName' in expected_element['script']['arguments']:
                        assert expected_element['script']['arguments']['argumentName'] == \
                            real_element['script']['arguments']['argumentName']
            elif 'annoTask' in expected_element:
                assert expected_element['annoTask']['name'] == real_element['annoTask']['name']
                assert expected_element['annoTask']['type'] == real_element['annoTask']['type']
                assert expected_element['annoTask']['userName'] == real_element['annoTask']['userName']
                assert expected_element['annoTask']['instructions'] == real_element['annoTask']['instructions']
                assert expected_element['annoTask']['labelLeaves'][0]['id'] == \
                real_element['annoTask']['labelLeaves'][0]['id']
                assert expected_element['annoTask']['instructions'] == real_element['annoTask']['instructions']
                if 'configuration' in expected_element['annoTask']:
                    assert expected_element['annoTask']['configuration']['tools'][0] == \
                    real_element['annoTask']['configuration']['tools'][0]
            elif 'dataExport' in expected_element:
                assert 'dataExport' in real_element
            elif 'loop' in expected_element:
                assert expected_element['loop']['maxIteration'] == real_element['loop']['maxIteration']
                assert expected_element['loop']['peJumpId'] == real_element['loop']['peJumpId']
                assert expected_element['loop']['iteration'] == real_element['loop']['iteration']
                assert expected_element['loop']['isBreakLoop'] == real_element['loop']['isBreakLoop']
            elif 'visualOutput' in expected_element:
                assert len(expected_element['visualOutput']) == len(real_element['visualOutput'])
            else:
                print('Expected PipelineElement is not present: \n{}'.format(expected_element))
                assert False