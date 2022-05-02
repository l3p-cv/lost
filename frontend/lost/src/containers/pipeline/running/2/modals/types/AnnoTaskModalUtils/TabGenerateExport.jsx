import React, { useEffect, useState } from 'react'

import {
    CDropdown,
    CDropdownItem,
    CDropdownToggle,
    CDropdownMenu,
    CRow,
    CCol,
    CSwitch,
    CInput,
    CBadge,
} from '@coreui/react'
import { faPlay } from '@fortawesome/free-solid-svg-icons'
import HelpButton from '../../../../../../../components/HelpButton'
import IconButton from '../../../../../../../components/IconButton'
import * as annoTaskApi from '../../../../../../../actions/annoTask/anno_task_api'
import * as Notification from '../../../../../../../components/Notification'

const TabGenerateExport = (props) => {
    const {
        data: annoTaskExportData,
        mutate: generateExport,
        status: generateExportStatus,
    } = annoTaskApi.useGenerateExport()

    const [newExport, setNewExport] = useState({
        exportName: 'LOST_Annotation',
        exportType: 'LOST_Dataset',
        annotatedOnly: true,
        includeImages: false,
        randomSplits: {
            active: false,
            train: 0.7,
            test: 0.2,
            val: 0.1,
        },
    })

    useEffect(() => {
        if (generateExportStatus === 'success') {
            Notification.showSuccess('Your annotation export will now be created.')
        }
        if (generateExportStatus === 'error') {
            Notification.showError('Error while creating your export.')
        }
    }, [generateExportStatus])

    const onGenerateExport = () => {
        const data = { annotaskId: props.annotask.id, exportConfig: newExport }
        generateExport(data)
        props.setActive(0)
    }
    const validateSplit = (splitType, value) => {
        let splits = {}
        if (splitType === 'train') {
            splits = { ...newExport.randomSplits, train: parseFloat(value) }
        }
        if (splitType === 'test') {
            splits = { ...newExport.randomSplits, test: parseFloat(value) }
        }
        if (splitType === 'val') {
            splits = { ...newExport.randomSplits, val: parseFloat(value) }
        }
        if (splits.train + splits.test + splits.val <= 1.0) {
            setNewExport({ ...newExport, randomSplits: splits })
        }
    }

    return (
        <>
            <CRow style={{ marginLeft: '5px' }}>
                <CCol sm="6">
                    <CRow style={{ marginTop: '10px', marginBottom: '20px' }}>
                        <CCol sm="12">
                            <h4>
                                Export Name
                                <HelpButton
                                    id="export-name"
                                    text={`Give your export file a name.`}
                                />
                            </h4>
                            <CRow
                                style={{
                                    marginLeft: '5px',
                                    marginTop: '10px',
                                }}
                            >
                                <CInput
                                    type="text"
                                    style={{ maxWidth: '50%' }}
                                    value={newExport.exportName}
                                    onChange={(e) =>
                                        setNewExport({
                                            ...newExport,
                                            exportName: e.currentTarget.value,
                                        })
                                    }
                                />
                            </CRow>
                        </CCol>
                    </CRow>
                    <CRow style={{ marginTop: '10px', marginBottom: '10px' }}>
                        <CCol sm="12">
                            <h4>
                                {`Annotated only`}
                                <HelpButton
                                    id="anno-only"
                                    text={
                                        'Only add annotations from already annotated images to the export.'
                                    }
                                />
                            </h4>
                            <CRow>
                                <CCol>
                                    <CSwitch
                                        className={'mx-1'}
                                        variant={'3d'}
                                        color={'primary'}
                                        checked={newExport.annotatedOnly}
                                        onChange={(e) =>
                                            setNewExport({
                                                ...newExport,
                                                annotatedOnly: !newExport.annotatedOnly,
                                            })
                                        }
                                    />
                                </CCol>
                            </CRow>
                        </CCol>
                    </CRow>
                    <CRow style={{ marginTop: '10px', marginBottom: '10px' }}>
                        <CCol sm="12">
                            <h4>
                                {`Include Images`}
                                <HelpButton
                                    id="include-images"
                                    text={
                                        'Whether images should be packed into the export. (Attention, the file size can become very large). '
                                    }
                                />
                            </h4>
                            <CRow>
                                <CCol sm="12">
                                    <CSwitch
                                        className={'mx-1'}
                                        variant={'3d'}
                                        color={'primary'}
                                        checked={newExport.includeImages}
                                        onChange={(e) =>
                                            setNewExport({
                                                ...newExport,
                                                includeImages: !newExport.includeImages,
                                            })
                                        }
                                    />
                                    {newExport.includeImages ? (
                                        <CBadge
                                            color="primary"
                                            shape="pill"
                                            style={{ marginLeft: '20px' }}
                                        >
                                            {newExport.annotatedOnly
                                                ? `${props.annotask.annotatedImgCount} images`
                                                : `${props.annotask.imgCount} images`}
                                        </CBadge>
                                    ) : (
                                        ''
                                    )}
                                </CCol>
                            </CRow>
                        </CCol>
                    </CRow>
                    <CRow style={{ marginTop: '10px', marginBottom: '10px' }}>
                        <CCol sm="12">
                            <h4>
                                Export Type
                                <HelpButton
                                    id="export-type"
                                    text={'Type of data export. '}
                                />
                            </h4>
                            <CRow>
                                <CCol sm="12">
                                    <CRow style={{ marginLeft: '5px' }}>
                                        <CDropdown>
                                            <CDropdownToggle color="secondary">
                                                {newExport.exportType}
                                            </CDropdownToggle>
                                            <CDropdownMenu>
                                                <CDropdownItem
                                                    href="#"
                                                    onClick={(e) =>
                                                        setNewExport({
                                                            ...newExport,
                                                            exportType: 'LOST_Dataset',
                                                        })
                                                    }
                                                >
                                                    LOST_Dataset
                                                </CDropdownItem>
                                                {/* <CDropdownItem
                                                    href="#"
                                                    onClick={(e) =>
                                                        setNewExport({
                                                            ...newExport,
                                                            exportType: 'PascalVOC',
                                                        })
                                                    }
                                                >
                                                    PascalVOC
                                                </CDropdownItem>
                                                <CDropdownItem
                                                    href="#"
                                                    onClick={(e) =>
                                                        setNewExport({
                                                            ...newExport,
                                                            exportType: 'MS_Coco',
                                                        })
                                                    }
                                                >
                                                    MSCoco
                                                </CDropdownItem>
                                                <CDropdownItem
                                                    href="#"
                                                    onClick={(e) =>
                                                        setNewExport({
                                                            ...newExport,
                                                            exportType: 'YOLO',
                                                        })
                                                    }
                                                >
                                                    YOLO
                                                </CDropdownItem> */}

                                                <CDropdownItem
                                                    href="#"
                                                    onClick={(e) =>
                                                        setNewExport({
                                                            ...newExport,
                                                            exportType: 'CSV',
                                                        })
                                                    }
                                                >
                                                    CSV
                                                </CDropdownItem>
                                            </CDropdownMenu>
                                        </CDropdown>
                                    </CRow>
                                </CCol>
                            </CRow>
                        </CCol>
                    </CRow>
                </CCol>
                <CCol sm="6">
                    <CRow style={{ marginTop: '10px', marginBottom: '40px' }}>
                        <CCol sm="12">
                            <h4>
                                Split Dataset
                                <HelpButton
                                    id="split-ds"
                                    text={`If these settings are active, 
                                the dataset will be split into the parts indicated below. 
                                This is done randomly based on the image path.`}
                                />
                            </h4>
                            <CRow>
                                <CCol sm="12">
                                    <CSwitch
                                        className={'mx-1'}
                                        variant={'3d'}
                                        color={'primary'}
                                        checked={newExport.randomSplits.active}
                                        onChange={(e) =>
                                            setNewExport({
                                                ...newExport,
                                                randomSplits: {
                                                    train: newExport.randomSplits.train,
                                                    test: newExport.randomSplits.test,
                                                    val: newExport.randomSplits.val,
                                                    active: !newExport.randomSplits
                                                        .active,
                                                },
                                            })
                                        }
                                    />{' '}
                                    <b
                                        style={{
                                            marginLeft: '20px',
                                        }}
                                    >
                                        Active
                                        <HelpButton
                                            id="random-splits"
                                            text={'Enable random splits'}
                                        />
                                    </b>
                                </CCol>
                            </CRow>
                            {newExport.randomSplits.active ? (
                                <>
                                    <CRow
                                        style={{
                                            marginLeft: '5px',
                                            marginTop: '10px',
                                        }}
                                    >
                                        <CInput
                                            type="number"
                                            min={0.0}
                                            step={0.01}
                                            max={1.0}
                                            style={{ maxWidth: '20%' }}
                                            value={newExport.randomSplits.train}
                                            onChange={(e) =>
                                                validateSplit(
                                                    'train',
                                                    e.currentTarget.value,
                                                )
                                            }
                                        />
                                        <b
                                            style={{
                                                marginLeft: '20px',
                                            }}
                                        >
                                            Train
                                            <HelpButton
                                                id="split-train"
                                                text={'Split for train.'}
                                            />
                                        </b>
                                    </CRow>
                                    <CRow
                                        style={{
                                            marginLeft: '5px',
                                            marginTop: '10px',
                                        }}
                                    >
                                        <CInput
                                            type="number"
                                            min={0.0}
                                            step={0.01}
                                            max={1.0}
                                            style={{ maxWidth: '20%' }}
                                            value={newExport.randomSplits.test}
                                            onChange={(e) =>
                                                validateSplit(
                                                    'test',
                                                    e.currentTarget.value,
                                                )
                                            }
                                        />
                                        <b
                                            style={{
                                                marginLeft: '20px',
                                            }}
                                        >
                                            Test
                                            <HelpButton
                                                id="split-test"
                                                text={'Split for test.'}
                                            />
                                        </b>
                                    </CRow>
                                    <CRow
                                        style={{
                                            marginLeft: '5px',
                                            marginTop: '10px',
                                        }}
                                    >
                                        <CInput
                                            type="number"
                                            min={0.0}
                                            step={0.01}
                                            max={1.0}
                                            style={{ maxWidth: '20%' }}
                                            value={newExport.randomSplits.val}
                                            onChange={(e) =>
                                                validateSplit(
                                                    'val',
                                                    e.currentTarget.value,
                                                )
                                            }
                                        />
                                        <b
                                            style={{
                                                marginLeft: '20px',
                                            }}
                                        >
                                            Val
                                            <HelpButton
                                                id="split-val"
                                                text={'Split for val.'}
                                            />
                                        </b>
                                    </CRow>
                                </>
                            ) : (
                                ''
                            )}
                        </CCol>
                    </CRow>
                </CCol>
            </CRow>
            <CRow className="justify-content-center" style={{ marginBottom: '20px' }}>
                <IconButton
                    isOutline={false}
                    disabled={newExport.exportName === ''}
                    color="primary"
                    onClick={() => onGenerateExport()}
                    icon={faPlay}
                    text="Generate export"
                    style={{ marginRight: '20px' }}
                ></IconButton>
            </CRow>
        </>
    )
}

export default TabGenerateExport
