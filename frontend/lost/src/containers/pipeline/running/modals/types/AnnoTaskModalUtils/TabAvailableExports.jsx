import { faDownload, faTrash } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import { saveAs } from 'file-saver'
import { useEffect } from 'react'
import ReactTable from 'react-table'
import * as annoTaskApi from '../../../../../../actions/annoTask/anno_task_api'
import IconButton from '../../../../../../components/IconButton'
import * as Notification from '../../../../../../components/Notification'
import { getColor } from '../../../../../../containers/Annotation/AnnoTask/utils'
import { API_URL } from '../../../../../../lost_settings'
import { CProgress } from '@coreui/react'

const TabAvailableExports = (props) => {
    const {
        data: deleteExportData,
        mutate: deleteExport,
        status: deleteExportStatus,
    } = annoTaskApi.useDeleteExport()

    const downloadFile = (dataExportId, dataExportType, dataExportName) => {
        axios
            .get(`${API_URL}/annotasks/exports/${dataExportId}`, {
                responseType: 'blob', // will make sure, that response is interpreted as blob
            })
            .then((res) => {
                const blob = new Blob([res.data], { type: 'application/octet-stream' })
                saveAs(blob, `${dataExportName}.${dataExportType}`)
            })
            .catch((error) => {
                console.error('Download fehlgeschlagen:', error)
            })
    }

    const handleAnnotaskExportDelete = (annoTaskExportId) => {
        Notification.showDecision({
            title: 'Do you really want to delete your annotation export ?',
            option1: {
                text: 'YES',
                callback: () => {
                    deleteExport(annoTaskExportId)
                },
            },
            option2: {
                text: 'NO!',
                callback: () => {},
            },
        })
    }

    useEffect(() => {
        if (deleteExportStatus === 'success') {
            Notification.showSuccess('Your annotation export will be deleted.')
        }
        if (deleteExportStatus === 'error') {
            Notification.showError('Error while deleting your export.')
        }
    }, [deleteExportStatus])
    //
    const getFileSize = (fileSize) => {
        if (fileSize < 1024) {
            return <>{Number(fileSize.toFixed(2))} Bytes</>
        }
        if (fileSize < 1048576) {
            return <>{Number((fileSize / 1024).toFixed(2))} kBytes</>
        }
        if (fileSize < 1073741824) {
            return <>{Number((fileSize / 1024 / 1024).toFixed(2))} MBytes</>
        }
        return <>{Number((fileSize / 1024 / 1024 / 1024).toFixed(2))} GBytes</>
    }
    return (
        <>
            <ReactTable
                columns={[
                    {
                        Header: 'Name / Date',
                        accessor: 'name',
                        Cell: (row) => {
                            return (
                                <>
                                    <b>{row.original.name}</b>
                                    <div className="small text-muted">
                                        {new Date(
                                            row.original.timestamp,
                                        ).toLocaleString()}
                                    </div>
                                </>
                            )
                        },
                    },
                    {
                        Header: 'Annotask Progress',
                        accessor: 'annotaskProgress',
                        Cell: (row) => {
                            return (
                                <>
                                    <b>{`${row.original.annotaskProgress} %`}</b>
                                    <div className="small text-muted">
                                        {`${row.original.imgCount} Images`}
                                    </div>
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
                                <>
                                    <div className="clearfix">
                                        {/* <div className="float-left"> */}
                                        <strong>{progress}%</strong>
                                        {/* </div> */}
                                        <CProgress
                                            className="progress-xs rt-progress"
                                            color={getColor(progress)}
                                            value={progress}
                                        />
                                        {progress < 100 ? (
                                            ''
                                        ) : (
                                            <div className="small text-muted">
                                                {getFileSize(row.original.fileSize)}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )
                        },
                    },
                    {
                        Header: 'Delete',
                        accessor: 'name',
                        Cell: (row) => {
                            return (
                                <IconButton
                                    color="danger"
                                    disabled={row.original.progress < 100}
                                    icon={faTrash}
                                    onClick={() =>
                                        handleAnnotaskExportDelete(row.original.id)
                                    }
                                ></IconButton>
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
                                        downloadFile(
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
                data={props.dataExports}
                defaultPageSize={5}
                className="-striped -highlight"
            />
        </>
    )
}

export default TabAvailableExports
