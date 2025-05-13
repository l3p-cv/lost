import { CCol, CRow, CTable, CTableBody, CTableHead, CContainer } from '@coreui/react'
import { faAngleLeft, faAngleRight, faEye, faPlay, faPause, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import { Progress } from 'reactstrap'
import {
    usePipelines, usePlayPipeline, usePausePipeline, useDeletePipeline,
    useTemplates
} from '../../../actions/pipeline/pipeline_api'
import BaseContainer from '../../../components/BaseContainer'
import { CenteredSpinner } from '../../../components/CenteredSpinner'
import HelpButton from '../../../components/HelpButton'
import IconButton from '../../../components/IconButton'
import { getColor } from '../../Annotation/AnnoTask/utils'
import '../globalComponents/pipeline.scss'
import { CButton, CButtonGroup } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { alertDeletePipeline } from '../globalComponents/Sweetalert'
import { template } from 'lodash'
import { useState, useEffect } from 'react';
// import React, { Fragment, useEffect } from 'react'
// import {
//     createColumnHelper,
//     flexRender,
//     getCoreRowModel,
//     getExpandedRowModel,
//     getFilteredRowModel,
//     getPaginationRowModel,
//     useReactTable,
// } from '@tanstack/react-table'

export const RunningPipelines = () => {
    const navigate = useNavigate()
    const { data, isError, isLoading } = usePipelines()
    const { data: templateData,
        isLoading: templateIsLoading,
        isError: templateIsError } = useTemplates('all')
    // const { data: datasetList, refetch: reloadDatasetList } = usePipelines()
    const { mutate: pausePipeline } = usePausePipeline()
    const { mutate: playPipeline } = usePlayPipeline()
    const { mutate: deletePipeline } = useDeletePipeline()
    const pausePipelineHandler = (data) => {
        pausePipeline(data.id)
    }
    const playPipelineHandler = (data) => {
        playPipeline(data.id)
    }

    const deletePipelineHandler = async (data) => {
        const response = await alertDeletePipeline()
        if (response.value) {
            deletePipeline(data.id)
        }
    }

    function UnPauseButton({ original }) {
        return (
            <CButton
                color={original.progress === 'PAUSED' ? "primary" : "primary"}
                style={{ marginRight: '5px' }}
                onClick={() =>
                    original.progress === 'PAUSED'
                        ? playPipelineHandler(original)
                        : pausePipelineHandler(original)
                }
            // text={original.progress === 'PAUSED' ? "Play" : "Pause"}
            >
                <FontAwesomeIcon icon={original.progress === 'PAUSED' ? faPlay : faPause}></FontAwesomeIcon>
            </CButton>
        )
    }

    function DeleteButton({ original }) {
        return (
            <CButton
                color={"primary"}
                onClick={() =>
                    deletePipelineHandler(original)
                }
            >
                <FontAwesomeIcon icon={faTrash} />
            </CButton>
        )
    }

    function OpenIcon({ original }) {
        return (<IconButton
            color="primary"
            size="m"
            isOutline={false}
            style={{ marginRight: '5px' }}
            onClick={() => navigate(`/pipeline/${original.id}`)}
            icon={faEye}
        />)
    }


    const TemplateDescButton = ({ templates, templName, pipeID }) => {
        const match = templates.find(t => t.name === templName);
        return (
            <HelpButton
                id={`${pipeID}_${match.id}`}
                text={match.description} />
        );
    };


    const renderDatatable = () => {
        if (isLoading || templateIsLoading) {
            return <CenteredSpinner />
        }

        if (isError || templateIsError) {
            return <div className="pipeline-error-message">Error loading data</div>
        }
        if (data && templateData) {
            if (data.error || templateData.error) {
                return <div className="pipeline-error-message">{data.error}</div>
            }
            const tableData = data.pipes
            console.log("RENDERING!!!")
            return (
                <ReactTable
                    columns={[
                        {
                            Header: 'Name',
                            accessor: 'name',
                            Cell: ({ original }) => (
                                <>
                                    <b>{original.name}</b>
                                    <HelpButton
                                        id={original.id}
                                        text={original.description}
                                    />
                                    <div className="small text-muted">
                                        {`ID: ${original.id}`}
                                    </div>
                                </>
                            ),
                        },
                        {
                            Header: 'Template',
                            accessor: 'templateName',
                            Cell: ({ original }) => (
                                <>
                                    <b>{original.templateName.split('.')[1]}</b>
                                    <TemplateDescButton
                                        templName={original.templateName}
                                        templates={templateData.templates}
                                        pipeID={original.id}
                                    />
                                    <div className="small text-muted">
                                        {original.templateName.split('.')[0]}
                                    </div>
                                </>
                            ),
                        },
                        {
                            Header: 'Progress',
                            accessor: 'progress',
                            Cell: ({ value }) => {
                                const progress = parseInt(value)
                                if (value === 'ERROR') {
                                    return (
                                        <div>ERROR</div>
                                    )
                                }
                                if (value === 'PAUSED') {
                                    return (
                                        <div>PAUSED</div>
                                    )
                                }
                                return (
                                    <Progress
                                        className="progress-xs rt-progress"
                                        color={getColor(progress)}
                                        value={progress}
                                    />
                                )
                            },
                        },
                        {
                            Header: 'Started on',
                            accessor: 'date',
                            Cell: ({ original }) =>
                                new Date(original.date).toLocaleString(),
                            sortMethod: (date1, date2) => {
                                return new Date(date1) > new Date(date2) ? -1 : 1
                            },
                        },
                        {
                            Header: 'Options',
                            accessor: 'id',
                            Cell: ({ original }) => (
                                <>
                                    {/* <CButtonGroup role="group" aria-label="Basic mixed styles example"> */}
                                    <OpenIcon original={original} />
                                    <UnPauseButton original={original} />
                                    <DeleteButton original={original} />
                                    {/* </CButtonGroup> */}
                                </>
                            ),
                        },
                    ]}
                    defaultSorted={
                        [
                            {
                                id: 'date',
                                desc: false,
                            },
                        ]}
                    data={tableData}
                    defaultPageSize={10}
                    className="-striped -highlight"
                />
            )
        }
    }

    return (
        <CContainer style={{ marginTop: '15px' }}>
            <h3 className="card-title mb-3" style={{ textAlign: 'center' }}>
                Pipelines
            </h3>
            <BaseContainer>
                <div className="pipeline-running-1">{renderDatatable()}</div>
            </BaseContainer>
        </CContainer>
    )
}
