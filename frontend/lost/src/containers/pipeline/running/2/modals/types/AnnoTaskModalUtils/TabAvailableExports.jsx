import React, { useEffect, useState } from 'react'
import { useInterval } from 'react-use'
import { Progress } from 'reactstrap'
import ReactTable from 'react-table'
import { saveAs } from 'file-saver'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import { API_URL } from '../../../../../../../lost_settings'
import IconButton from '../../../../../../../components/IconButton'
import * as annoTaskApi from '../../../../../../../actions/annoTask/anno_task_api'
import { getColor } from '../../../../../../../containers/Annotation/AnnoTask/utils'

const TabAvailableExports = (props) => {
    const [dataExports, setDataExports] = useState([])
    const { data: dataExportData, refetch } = annoTaskApi.useGetDataexports(
        props.annotaskId,
    )
    useInterval(() => {
        refetch()
    }, 1000)
    useEffect(() => {
        if (dataExportData) {
            setDataExports(dataExportData)
        }
    }, [dataExportData])

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
                            return new Date(row.original.timestamp).toLocaleString('de')
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
                                        (row.original.fileSize / 1024 / 1024).toFixed(2),
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
        </>
    )
}

export default TabAvailableExports
