import React, { useEffect, useState } from 'react'
import { faEarListen, faFileExport, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useInterval } from 'react-use'
import IconButton from '../../components/IconButton'
import Datatable from '../../components/Datatable'
import { API_URL } from '../../lost_settings'
import { saveAs } from 'file-saver'
import { CRow, CBadge } from '@coreui/react'
import * as Notification from '../../components/Notification'

import * as pipelineProjectsApi from '../../actions/pipeline/pipeline_projects_api'
import AddPipelineProject from './AddPipelineProject'

const PTTable = ({ visLevel }) => {
    const [tableData, setTableData] = useState([])
    const { data: pipelineProjects, refetch } =
        pipelineProjectsApi.usePipelineProjects(visLevel)

    const { mutate: deletePipelineProject, status: deletePipelineProjectStatus } =
        pipelineProjectsApi.useDeletePipelineProject()

    const [projectNames, setProjectNames] = useState([])

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
        deletePipelineProject({ pipeProject })
    }
    useEffect(() => {
        if (pipelineProjects) {
            if (pipelineProjects.templates) {
                setTableData(pipelineProjects.templates)
                const pNames = pipelineProjects.templates.map((el) => {
                    return el.pipeProject
                })
                setProjectNames(pNames)
            }
        }
    }, [pipelineProjects])
    useInterval(() => {
        refetch()
    }, 1000)
    useEffect(() => {
        if (deletePipelineProjectStatus === 'success') {
            refetch()
            Notification.showSuccess('Deletion succeeded.')
        }
        if (deletePipelineProjectStatus === 'error') {
            Notification.showError('Deletion failed.')
        }
    }, [deletePipelineProjectStatus])

    return (
        <>
            <CRow style={{ marginBottom: 10, marginLeft: 3 }}>
                <AddPipelineProject
                    visLevel={visLevel}
                    projectNames={projectNames}
                    refetch={refetch}
                />
            </CRow>
            {tableData.length > 0 ? (
                <Datatable
                    data={tableData}
                    columns={[
                        {
                            Header: 'Project / Imported on',
                            accessor: 'pipeProject',
                            Cell: (row) => {
                                return (
                                    <>
                                        <b>{row.original.pipeProject}</b>
                                        <div className="small text-muted">
                                            {new Date(row.original.date).toLocaleString()}
                                        </div>
                                    </>
                                )
                            },
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
                            Header: 'Pipelines started',
                            Cell: (row) => {
                                return (
                                    <CBadge shape="pill" color="primary">
                                        {row.value}
                                    </CBadge>
                                )
                            },
                            accessor: 'pipelineCount',
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
                                        disabled={d.pipelineCount > 0}
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
