import React, { useEffect, useState } from 'react'
import { useInterval } from 'react-use'
import HelpButton from '../../../../../../components/HelpButton'
import IconButton from '../../../../../../components/IconButton'
import {
    CDropdown,
    CDropdownItem,
    CDropdownToggle,
    CDropdownMenu,
    CRow,
    CCol,
    CSwitch,
    CInput,
} from '@coreui/react'
import { Progress } from 'reactstrap'
import { API_URL } from '../../../../../../lost_settings'
import { faPlay, faDownload, faCheck } from '@fortawesome/free-solid-svg-icons'
import CollapseCard from '../../../../globalComponents/modals/CollapseCard'
import ReactTable from 'react-table'
import * as annoTaskApi from '../../../../../../actions/annoTask/anno_task_api'
import { getColor } from '../../../../../../containers/Annotation/AnnoTask/utils'
import { saveAs } from 'file-saver'
import * as Notification from '../../../../../../components/Notification'

const InstantAnnoExport = (props) => {
    const {
        data: annoTaskExportData,
        mutate: generateExport,
        status: generateExportStatus,
    } = annoTaskApi.useGenerateExport()
    const { data: dataExportData, refetch } = annoTaskApi.useGetDataexports(
        props.annotaskId,
    )
    const [dataExports, setDataExports] = useState([])
    const [newExport, setNewExport] = useState({
        exportName: 'Annotation',
        exportType: 'LOST_Dataset',
        includeImages: false,
        randomSplits: {
            active: true,
            train: 0.7,
            test: 0.2,
            val: 0.1,
        },
    })
    useInterval(() => {
        refetch()
    }, 1000)

    useEffect(() => {
        if (generateExportStatus === 'success') {
            Notification.showSuccess('Your annotation export will now be created.')
        }
        if (generateExportStatus === 'error') {
            Notification.showError('Error while creating your export.')
        }
    }, [generateExportStatus])
    useEffect(() => {
        if (dataExportData) {
            setDataExports(dataExportData)
        }
    }, [dataExportData])
    const onGenerateExport = () => {
        console.log('Generate Export')
        const data = { annotaskId: props.annotaskId, exportConfig: newExport }
        generateExport(data)
    }
    const validateSplit = (splitType, value) => {
        console.log(splitType, value)
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
        console.log(splits)
        if (splits.train + splits.test + splits.val <= 1.0) {
            setNewExport({ ...newExport, randomSplits: splits })
        }
    }
    const handleAnnotaskDataExport = (dataExportId, dataExportType, dataExportName) => {
        fetch(`${API_URL}/anno_task/data_export/download/${dataExportId}`, {
            method: 'get',
            headers: new Headers({
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            }),
        })
            .then((res) => res.blob())
            .then((blob) => saveAs(blob, `${dataExportName}.${dataExportType}`))
    }
    return (
        <>
            <CollapseCard
                btnOutline={true}
                btnColor="primary"
                // iconColor="#CED2D8"
                icon={faPlay}
                buttonText="Generate new Export"
            >
                <CRow style={{ marginTop: '20px', marginBottom: '20px' }}>
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
                            Include Images
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
                            </CCol>
                        </CRow>
                    </CCol>
                </CRow>
                <CRow style={{ marginTop: '10px', marginBottom: '10px' }}>
                    <CCol sm="12">
                        <h4>
                            Export Type
                            <HelpButton id="export-type" text={'Type of data export. '} />
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
                                            <CDropdownItem
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
                                            </CDropdownItem>
                                            {newExport.includeImages ? (
                                                ''
                                            ) : (
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
                                            )}
                                        </CDropdownMenu>
                                    </CDropdown>
                                </CRow>
                            </CCol>
                        </CRow>
                    </CCol>
                </CRow>
                <hr></hr>
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
                                                active: !newExport.randomSplits.active,
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
                                            validateSplit('train', e.currentTarget.value)
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
                                            validateSplit('test', e.currentTarget.value)
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
                                            validateSplit('val', e.currentTarget.value)
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
                <CRow className="justify-content-center" style={{ marginBottom: '20px' }}>
                    <IconButton
                        isOutline={false}
                        color="primary"
                        onClick={() => onGenerateExport()}
                        icon={faPlay}
                        text="Generate export"
                        style={{ marginRight: '20px' }}
                    ></IconButton>
                </CRow>
            </CollapseCard>
            <CollapseCard
                btnOutline={true}
                btnColor="primary"
                // iconColor="#CED2D8"
                icon={faCheck}
                buttonText="Available Exports"
            >
                <ReactTable
                    columns={[
                        {
                            Header: 'Name',
                            accessor: 'name',
                            Cell: (row) => {
                                return <b>{row.original.name}</b>
                            },
                        },
                        {
                            Header: 'Exported on',
                            accessor: 'timestamp',
                            Cell: (row) => {
                                return new Date(row.original.timestamp).toLocaleString(
                                    'de',
                                )
                            },
                            sortMethod: (date1, date2) => {
                                if (new Date(date1) > new Date(date2)) {
                                    return -1
                                }
                                return 1
                            },
                        },
                        {
                            Header: 'File size',
                            accessor: 'fileSize',
                            Cell: (row) => {
                                return (
                                    <>
                                        {Number(
                                            (row.original.fileSize / 1024 / 1024).toFixed(
                                                2,
                                            ),
                                        )}{' '}
                                        MBytes
                                    </>
                                )
                            },
                        },
                        {
                            Header: 'Export progress',
                            accessor: 'progress',
                            Cell: (row) => {
                                const progress = parseInt(row.original.progress)
                                return (
                                    <Progress
                                        className="progress-xs rt-progress"
                                        color={getColor(progress)}
                                        value={progress}
                                    />
                                    // <Progress
                                    //     className="progress-xs rt-progress"
                                    //     color="warning"
                                    //     value={progress}
                                    // />
                                )
                            },
                        },
                        {
                            Header: 'Download',
                            accessor: 'name',
                            Cell: (row) => {
                                return (
                                    <IconButton
                                        color="primary"
                                        isOutline={false}
                                        disabled={row.original.progress < 100}
                                        icon={faDownload}
                                        onClick={() =>
                                            handleAnnotaskDataExport(
                                                row.original.id,
                                                row.original.fileType,
                                                row.original.name,
                                            )
                                        }
                                        text={'Download'}
                                    ></IconButton>
                                )
                            },
                        },
                    ]}
                    defaultSorted={[
                        {
                            id: 'timestamp',
                            desc: true,
                        },
                    ]}
                    data={dataExports}
                    defaultPageSize={10}
                    className="-striped -highlight"
                />
            </CollapseCard>
        </>
    )
}

export default InstantAnnoExport
