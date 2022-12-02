import React, { useEffect } from 'react'
import { createWriteStream } from 'streamsaver'
import { saveAs } from 'file-saver'
import { Progress } from 'reactstrap'
import ReactTable from 'react-table'
import { faDownload, faTrash } from '@fortawesome/free-solid-svg-icons'
import { API_URL } from '../../../../../../../lost_settings'
import IconButton from '../../../../../../../components/IconButton'
import * as annoTaskApi from '../../../../../../../actions/annoTask/anno_task_api'
import { getColor } from '../../../../../../../containers/Annotation/AnnoTask/utils'
import * as Notification from '../../../../../../../components/Notification'

const TabAvailableExports = (props) => {
    const {
        data: deleteExportData,
        mutate: deleteExport,
        status: deleteExportStatus,
    } = annoTaskApi.useDeleteExport()

    const downloadFile = (dataExportId, dataExportType, dataExportName) => {
        const isFirefox = typeof InstallTrigger !== 'undefined'
        if (isFirefox) {
            fetch(`${API_URL}/annotask/download_export/${dataExportId}`, {
                method: 'get',
                headers: new Headers({
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                }),
            })
                .then((res) => res.blob())
                .then((blob) => saveAs(blob, `${dataExportName}.${dataExportType}`))
        } else {
            return fetch(`${API_URL}/annotask/download_export/${dataExportId}`, {
                headers: new Headers({
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                }),
            })
                .then((res) => {
                    const fileStream = createWriteStream(
                        `${dataExportName}.${dataExportType}`,
                    )
                    const writer = fileStream.getWriter()
                    if (res.body.pipeTo) {
                        writer.releaseLock()
                        return res.body.pipeTo(fileStream)
                    }

                    const reader = res.body.getReader()
                    const pump = () =>
                        reader
                            .read()
                            .then(({ value, done }) =>
                                done ? writer.close() : writer.write(value).then(pump),
                            )

                    return pump()
                })
                .catch((e) => {
                    Notification.showError('Failed to download annotation export.')
                })
        }
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
                                        <Progress
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
