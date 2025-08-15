import { CBadge } from '@coreui/react'
import { faFileExport, faTrash } from '@fortawesome/free-solid-svg-icons'
import { saveAs } from 'file-saver'
import { useEffect, useState } from 'react'
import * as Notification from '../../components/Notification'
import { API_URL } from '../../lost_settings'

import * as pipelineProjectsApi from '../../actions/pipeline/pipeline_projects_api'
import AddPipelineProject from './AddPipelineProject'
import { createColumnHelper } from '@tanstack/react-table'
import CoreDataTable from '../../components/CoreDataTable'
import BaseContainer from '../../components/BaseContainer'
import CoreIconButton from '../../components/CoreIconButton'
import ErrorBoundary from '../../components/ErrorBoundary'

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
    // useInterval(() => {
    //     refetch()
    // }, 1000)
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
            header: 'Actions',
            id: "action",
            cell: (props) => {
                return (
                    <>
                    <CoreIconButton
                        icon={faFileExport}
                        style={{ marginRight: '5px' }}
                        toolTip="Export Pipeline Project"
                        color="info"
                        isOutline={true}
                        onClick={() =>
                            handlePipelineProjectExport(props.row.original.pipeProject)
                        }
                    />
                    <CoreIconButton
                        icon={faTrash}
                        style={{ marginRight: '5px' }}
                        toolTip="Delete Pipeline Project"
                        color="danger"
                        disabled={props.row.original.pipelineCount > 0}
                        onClick={() =>
                            handlePipelineProjectDelete(props.row.original.pipeProject)
                        }
                    />
                    </>
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
                    <ErrorBoundary>
                    <CoreDataTable columns={columns} tableData={tableData} />
                    </ErrorBoundary>
                </BaseContainer>
            ) : (
                ''
            )}

        </>
    )
}
export default PTTable
