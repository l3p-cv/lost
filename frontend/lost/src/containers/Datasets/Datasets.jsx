import React from 'react'
import { CCol, CContainer, CRow } from '@coreui/react'
import IconButton from '../../components/IconButton'
import { faFolderPlus, faTag } from '@fortawesome/free-solid-svg-icons'
import DatasetTable from './DatasetTable'
import DatasetExportModal from './DatasetExportModal'

const datastores = {
    0: "This LOST instance",
    1: "MLDATA-SSI",
    2: "DerGeraet-SSH",
    3: "FTP01"
}

const datasetList = [
    {
        "id": 0,
        "name": "No Dataset",
        "description": "Dataset for all annotation tasks that have no dataset selected",
        "datasource": 0,
        "created_at": "2023-09-05 12:05:14",
        "annotasks": [],
    },
    {
        "id": 1,
        "name": "DS 1",
        "description": "Dataset about car parts",
        "datasource": 1,
        "created_at": "2023-09-05 12:05:14",
        "annotasks": [],
    },
    {
        "id": 2,
        "name": "DS 2",
        "description": "Dataset 2",
        "datasource": 3,
        "created_at": "2023-09-05 12:05:14",
        "annotasks": [{
            "isAnnotask": true,
            "id": 1,
            "name": "Annotask3475",
            "description": "Dataset about car parts",
            "created_at": "2023-09-05 12:05:14"
        }]
    },
    {
        "id": 3,
        "name": "DS 3",
        "description": "Dataset 3",
        "datasource": 2,
        "created_at": "2023-09-05 12:05:14",
        "annotasks": [{
            "isAnnotask": true,
            "id": 4,
            "name": "Annotask6553",
            "description": "Test Annotask",
            "created_at": "2023-06-05 15:05:57"
        }, {
            "isAnnotask": true,
            "id": 7,
            "name": "My next Annotask",
            "created_at": "2023-09-05 04:07:33"
        }]
    }
]

const annotask = {
    "elements": [
        {
            "id": 16,
            "peN": 16,
            "peOut": [
                17
            ],
            "state": "finished",
            "datasource": {
                "id": 6,
                "rawFilePath": "/home/lost/data/1/media/images/layout"
            }
        },
        {
            "id": 17,
            "peN": 17,
            "peOut": [
                18
            ],
            "state": "finished",
            "script": {
                "id": 1,
                "isDebug": false,
                "debugSession": null,
                "name": "found.request_annos.py",
                "description": "Request annotations for all images in a folder.",
                "path": "pipes/lost_ootb_pipes/found/request_annos.py",
                "arguments": {
                    "recursive": {
                        "value": "true",
                        "help": "Walk recursive through folder structure"
                    },
                    "valid_imgtypes": {
                        "value": "['.jpg', '.jpeg', '.png', '.bmp']",
                        "help": "Img types where annotations will be requested for!"
                    },
                    "shuffle": {
                        "value": "false",
                        "help": "Shuffle images before requesting annotations for them."
                    }
                },
                "envs": "[\"lost\"]",
                "progress": 100.0,
                "errorMsg": null,
                "warningMsg": null,
                "logMsg": null
            }
        },
        {
            "id": 18,
            "peN": 18,
            "peOut": [],
            "state": "in_progress",
            "annoTask": {
                "id": 6,
                "name": "Single Image Annotation Task",
                "type": "sia",
                "userName": "admin",
                "progress": 0.0,
                "imgCount": 5,
                "annotatedImgCount": 0,
                "instructions": "Please draw bounding boxes for all objects in image.",
                "configuration": {
                    "tools": {
                        "point": true,
                        "line": true,
                        "polygon": true,
                        "bbox": true,
                        "junk": true
                    },
                    "annos": {
                        "multilabels": false,
                        "actions": {
                            "draw": true,
                            "label": true,
                            "edit": true
                        },
                        "minArea": 250
                    },
                    "img": {
                        "multilabels": true,
                        "actions": {
                            "label": true
                        }
                    }
                },
                "labelLeaves": [
                    {
                        "id": 1,
                        "name": "VOC2012",
                        "color": null
                    }
                ]
            }
        }
    ],
    "id": 6,
    "name": "3",
    "description": "3",
    "managerName": "LOST Admin",
    "templateId": 1,
    "timestamp": "2023-09-26T08:33:14.000Z",
    "isDebug": false,
    "logfilePath": "/home/lost/data/1/logs/pipes/p-6.log",
    "progress": "66%",
    "startDefinition": {
        "name": "3",
        "description": "3",
        "elements": [
            {
                "peN": 0,
                "datasource": {
                    "rawFilePath": null,
                    "selectedPath": "/home/lost/data/1/media/images/layout",
                    "fs_id": 2
                }
            },
            {
                "peN": 1,
                "script": {
                    "arguments": {
                        "recursive": {
                            "value": "true",
                            "help": "Walk recursive through folder structure"
                        },
                        "valid_imgtypes": {
                            "value": "['.jpg', '.jpeg', '.png', '.bmp']",
                            "help": "Img types where annotations will be requested for!"
                        },
                        "shuffle": {
                            "value": "false",
                            "help": "Shuffle images before requesting annotations for them."
                        }
                    },
                    "description": "Request annotations for all images in a folder.",
                    "envs": "[\"lost\"]",
                    "id": 1,
                    "name": "found.request_annos.py",
                    "path": "request_annos.py",
                    "isDebug": false
                }
            },
            {
                "peN": 2,
                "annoTask": {
                    "name": "Single Image Annotation Task",
                    "type": "sia",
                    "instructions": "Please draw bounding boxes for all objects in image.",
                    "configuration": {
                        "tools": {
                            "point": true,
                            "line": true,
                            "polygon": true,
                            "bbox": true,
                            "junk": true
                        },
                        "annos": {
                            "multilabels": false,
                            "actions": {
                                "draw": true,
                                "label": true,
                                "edit": true
                            },
                            "minArea": 250
                        },
                        "img": {
                            "multilabels": false,
                            "actions": {
                                "label": true
                            }
                        }
                    },
                    "assignee": "admin (user)",
                    "workerId": 1,
                    "labelLeaves": [
                        {
                            "id": 1,
                            "maxLabels": "3"
                        }
                    ],
                    "selectedLabelTree": 1
                }
            }
        ],
        "templateId": 1
    }
}




const Datasets = () => {

    const openAddDatasetMenu = () => {
        console.log("Clicked on openAddDatasetMenu")
    }

    const openAssignAnnotaskMenu = () => {
        console.log("Clicked on assign annotask")
    }

    return (
        <>
            <DatasetExportModal
                name="Test"
                description="Test"
                annoTask={annotask}
                datastoreList={datastores}
                datasetList={datasetList}
            />
            <CContainer>
                <CRow>
                    <CCol sm="auto">
                        <IconButton
                            isOutline={false}
                            color="primary"
                            icon={faFolderPlus}
                            text="Add Dataset"
                            onClick={openAddDatasetMenu}
                            style={{ marginTop: '15px' }}
                        />
                    </CCol>
                    <CCol sm="auto">
                        <IconButton
                            isOutline={false}
                            color="primary"
                            icon={faTag}
                            text="Assign Annotasks"
                            onClick={openAssignAnnotaskMenu}
                            style={{ marginTop: '15px' }}
                        />
                    </CCol>
                </CRow>
                <CRow>
                    <CCol>
                        <DatasetTable datasets={datasetList} datasources={datastores} />
                    </CCol>
                </CRow>
            </CContainer>
        </>

    )
}

export default Datasets
