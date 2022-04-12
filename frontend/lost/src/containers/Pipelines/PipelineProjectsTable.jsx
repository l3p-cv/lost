import React, { useEffect, useState } from 'react'
import { faFileExport, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useInterval } from 'react-use'
import IconButton from '../../components/IconButton'
import Datatable from '../../components/Datatable'
import { API_URL } from '../../lost_settings'
import { saveAs } from 'file-saver'
import { CBadge } from '@coreui/react'
import * as Notification from '../../components/Notification'

import * as pipelineProjectsApi from '../../actions/pipeline/pipeline_projects_api'

const PTTable = ({ visLevel }) => {
    const [tableData, setTableData] = useState([])
    const { data: pipelineProjects, refetch } =
        pipelineProjectsApi.usePipelineProjects(visLevel)

    const { mutate: deletePipelineProject, status: deletePipelineProjectStatus } =
        pipelineProjectsApi.useDeletePipelineProject()

    function handlePipelineProjectExport(pipeProject) {
        fetch(`${API_URL}/pipeline/project/export/${pipeProject}`, {
            method: 'get',
            headers: new Headers({
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            }),
        })
            .then((res) => res.blob())
            .then((blob) => saveAs(blob, `${pipeProject}.zip`))
    }

    function handlePipelineProjectDelete(pipeProject) {
        console.log('Delete', pipeProject)
        deletePipelineProject({ pipeProject })
    }
    useEffect(() => {
        if (pipelineProjects) {
            if (pipelineProjects.templates) {
                setTableData(pipelineProjects.templates)
            }
        }
    }, [pipelineProjects])
    useInterval(() => {
        refetch()
    }, 1000)
    useEffect(() => {
        if (deletePipelineProjectStatus === 'success') {
            Notification.showSuccess('Deletion succeeded.')
        }
        if (deletePipelineProjectStatus === 'error') {
            Notification.showError('Deletion failed.')
        }
    }, [deletePipelineProjectStatus])

    return (
        <>
            {tableData.length > 0 ? (
                <Datatable
                    data={tableData}
                    columns={[
                        {
                            Header: 'Project',
                            accessor: 'pipeProject',
                        },
                        {
                            Header: 'Global',
                            id: 'group_id',
                            accessor: (d) => {
                                if (d.group_id) {
                                    return <CBadge color="success">User</CBadge>
                                }
                                return <CBadge color="primary">Global</CBadge>
                            },
                        },
                        {
                            Header: 'Date',
                            Cell: (row) => {
                                return new Date(row.value).toLocaleString('de')
                            },
                            accessor: 'date',
                            sortMethod: (date1, date2) => {
                                if (new Date(date1) > new Date(date2)) {
                                    return -1
                                }
                                return 1
                            },
                        },
                        {
                            Header: 'Delete',
                            id: 'delete',
                            accessor: (d) => {
                                return (
                                    <IconButton
                                        icon={faTrash}
                                        text="Delete"
                                        color="danger"
                                        onClick={() =>
                                            handlePipelineProjectDelete(d.pipeProject)
                                        }
                                    />
                                )
                            },
                        },
                        {
                            Header: 'Export',
                            id: 'export',
                            accessor: (d) => {
                                return (
                                    <IconButton
                                        icon={faFileExport}
                                        text="Export"
                                        color="primary"
                                        isOutline={false}
                                        onClick={() =>
                                            handlePipelineProjectExport(d.pipeProject)
                                        }
                                    />
                                )
                            },
                        },
                    ]}
                    defaultPageSize={10}
                />
            ) : (
                ''
            )}
        </>
    )
}
export default PTTable
