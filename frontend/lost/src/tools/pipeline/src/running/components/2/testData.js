 export default {
    "elements": [
        {
            "id": 1,
            "peN": 1,
            "peOut": [
                2
            ],
            "state": "finished",
            "datasource": {
                "id": 1,
                "type": "rawFile",
                "rawFilePath": "data/media/10_voc2012"
            }
        },
        {
            "id": 2,
            "peN": 2,
            "peOut": [
                3
            ],
            "state": "finished",
            "script": {
                "id": 1,
                "isDebug": false,
                "debugSession": null,
                "name": "request_annos.py",
                "description": "Request annotations for all images in a folder",
                "path": "data/pipes/sia/request_annos.py",
                "arguments": {
                    "polygon": {
                        "value": "true",
                        "help": "Add a dummy polygon proposal as example."
                    },
                    "line": {
                        "value": "false",
                        "help": "Add a dummy line proposal as example."
                    },
                    "point": {
                        "value": "false",
                        "help": "Add a dummy point proposal as example."
                    },
                    "bbox": {
                        "value": "false",
                        "help": "Add a dummy bbox proposal as example."
                    }
                },
                "executors": "[\"web\"]",
                "progress": 100.0,
                "errorMsg": null,
                "warningMsg": null,
                "logMsg": null
            }
        },
        {
            "id": 3,
            "peN": 3,
            "peOut": [
                4
            ],
            "state": "in_progress",
            "annoTask": {
                "id": 1,
                "name": "Single Image Annotation Task",
                "type": "sia",
                "userName": "admin",
                "progress": 60.0,
                "instructions": "Please draw bounding boxes for all objects in image.",
                "configuration": {
                    "tools": {
                        "point": true,
                        "line": true,
                        "polygon": true,
                        "bbox": true
                    },
                    "actions": {
                        "drawing": true,
                        "labeling": true,
                        "edit": {
                            "label": true,
                            "bounds": true,
                            "delete": true
                        }
                    },
                    "drawables": {
                        "bbox": {
                            "minArea": 25,
                            "minAreaType": "abs"
                        }
                    }
                },
                "labelLeaves": [
                    {
                        "id": 1,
                        "name": "dummy tree"
                    },
                    {
                        "id": 7,
                        "name": "trees"
                    },
                    {
                        "id": 6,
                        "name": "plant"
                    }
                ]
            }
        },
        {
            "id": 4,
            "peN": 4,
            "peOut": [
                5
            ],
            "state": "pending",
            "script": {
                "id": 2,
                "isDebug": false,
                "debugSession": null,
                "name": "export_csv.py",
                "description": "Export all annotations to a csv file.",
                "path": "data/pipes/sia/export_csv.py",
                "arguments": {
                    "file_name": {
                        "value": "annos.csv",
                        "help": "Name of the file with exported bbox annotations."
                    }
                },
                "executors": "[\"web\"]",
                "progress": null,
                "errorMsg": null,
                "warningMsg": null,
                "logMsg": null
            }
        },
        {
            "id": 5,
            "peN": 5,
            "peOut": [],
            "state": "pending",
            "dataExport": []
        }
    ],
    "id": 1,
    "name": "MyyFirstPip",
    "description": "fdfdfdf",
    "managerName": "LOST Admin",
    "templateId": 1,
    "timestamp": "Jan 29 2019 14:42:32",
    "isDebug": false,
    "logfilePath": "data/logs/pipes/p-1.log",
    "progress": "40%"
}
