import React, { useEffect, useState } from 'react'
import { faFileExport, faTrash } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../../components/IconButton'
import Datatable from '../../components/Datatable'
import { API_URL } from '../../lost_settings'
import { saveAs } from 'file-saver'
import { CBadge } from '@coreui/react'
import * as Notification from '../../components/Notification'

import * as pipelineTemplatesApi from '../../actions/pipeline/pipeline_templates_api'

const PTTable = ({ visLevel }) => {
    const [tableData, setTableData] = useState([])
    const { data: pipelineTemplates } =
        pipelineTemplatesApi.usePipelineTemplates(visLevel)

    const { mutate: deletePipelineTemplate, status: deletePipelineTemplateStatus } =
        pipelineTemplatesApi.useDeletePipelineTemplate()

    function handlePipelineTemplateExport(pipeline_template_name, pipeline_template_id) {
        console.log('Export', pipeline_template_id)
        fetch(`${API_URL}/pipeline/template/export/${pipeline_template_id}`, {
            method: 'get',
            headers: new Headers({
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            }),
        })
            .then((res) => res.blob())
            .then((blob) => saveAs(blob, `${pipeline_template_name}.zip`))
    }

    function handlePipelineTemplateDelete(pipeline_template_id) {
        console.log('Delete', pipeline_template_id)
        deletePipelineTemplate({ pipeline_template_id })
    }
    useEffect(() => {
        if (pipelineTemplates) {
            if (pipelineTemplates.templates) {
                setTableData(pipelineTemplates.templates)
            }
        }
    }, [pipelineTemplates])

    useEffect(() => {
        if (deletePipelineTemplateStatus === 'success') {
            Notification.showSuccess('Deletion succeeded.')
        }
        if (deletePipelineTemplateStatus === 'error') {
            Notification.showSuccess('Deletion failed.')
        }
    }, [deletePipelineTemplateStatus])

    return (
        <>
            {tableData.length > 0 ? (
                <Datatable
                    data={tableData}
                    columns={[
                        {
                            Header: 'Name',
                            accessor: 'name',
                        },
                        {
                            Header: 'Description',
                            accessor: 'description',
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
                                        onClick={() => handlePipelineTemplateDelete(d.id)}
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
                                            handlePipelineTemplateExport(d.name, d.id)
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
