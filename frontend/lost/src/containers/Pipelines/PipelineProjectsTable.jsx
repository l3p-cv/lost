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
import AddPipelineProject from './AddPipelineProject'
import { createColumnHelper } from '@tanstack/react-table'
import CoreDataTable from '../../components/CoreDataTable'
import BaseContainer from '../../components/BaseContainer'

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

    const columnHelper = createColumnHelper()
    const columns = [
        columnHelper.accessor('pipeProject', {
            header: 'Project / Imported on',
            cell: (props) => {
                return (
                    <>
                        <b>{props.row.original.pipeProject}</b>
                        <div className="small text-muted">
                            {new Date(props.row.original.date).toLocaleString()}
                        </div>
                    </>
                )
            },
        }),
        columnHelper.accessor('group_id', {
            header: 'Global',
            cell: (props) => {
                if (props.row.original.group_id) {
                    return <CBadge color="success">User</CBadge>
                }
                return <CBadge color="primary">Global</CBadge>
            },
        }),
        columnHelper.accessor('pipelinesStarted', {
            header: 'Pipelines started',
            cell: (props) => {
                return (
                    <CBadge shape="pill" color="primary">
                        {props.row.original.pipelineCount}
                    </CBadge>
                )
            },
        }),
        columnHelper.display({
            header: 'Delete',
            id: "delete",
            cell: (props) => {
                return (
                    <IconButton
                        icon={faTrash}
                        text="Delete"
                        color="danger"
                        disabled={props.row.original.pipelineCount > 0}
                        onClick={() =>
                            handlePipelineProjectDelete(props.row.original.pipeProject)
                        }
                    />
                )
            },
        }),
        columnHelper.display({
            header: 'Export',
            id: "export",
            cell: (props) => {
                return (
                    <IconButton
                        icon={faFileExport}
                        text="Export"
                        color="primary"
                        isOutline={false}
                        onClick={() =>
                            handlePipelineProjectExport(props.row.original.pipeProject)
                        }
                    />
                )
            },
        }),
    ]

    return (
        <>
            {/* <CRow style={{ marginBottom: 10, marginLeft: 3 }}> */}

            <AddPipelineProject
                visLevel={visLevel}
                projectNames={projectNames}
                refetch={refetch}
            />
            {/* </CRow> */}
            {tableData.length > 0 ? (
                <BaseContainer>
                    <CoreDataTable columns={columns} tableData={tableData} />
                </BaseContainer>
            ) : (
                ''
            )}

        </>
    )
}
export default PTTable
