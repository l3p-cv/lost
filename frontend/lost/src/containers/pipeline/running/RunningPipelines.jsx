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
import { CButton, CButtonGroup, CTooltip } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { alertDeletePipeline } from '../globalComponents/Sweetalert'
import { template } from 'lodash'
import { useState, useEffect, useMemo } from 'react';
import CoreDataTable from '../../../components/CoreDataTable'
import { createColumnHelper } from '@tanstack/react-table'
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
            <CTooltip placement="top"
                content={original.progress === 'PAUSED'
                    ? "Activate Pipeline"
                    : "Pause Pipeline"
                }>
                <CButton
                    color={original.progress === 'PAUSED' ? "success" : "warning"}
                    variant='outline'
                    style={{ marginRight: '5px' }}
                    onClick={() =>
                        original.progress === 'PAUSED'
                            ? playPipelineHandler(original)
                            : pausePipelineHandler(original)
                    }
                // text={original.progress === 'PAUSED' ? "Play" : "Pause"}
                >
                    <FontAwesomeIcon icon={original.progress === 'PAUSED' ? faPlay : faPause} />
                </CButton>
            </CTooltip>
        )
    }

    function DeleteButton({ original }) {
        return (
            <CTooltip content="Delete Pipeline" placement="top">
                <CButton
                    color={"danger"}
                    variant='outline'
                    onClick={() =>
                        deletePipelineHandler(original)
                    }
                >
                    <FontAwesomeIcon icon={faTrash} />
                </CButton>
            </CTooltip>
        )
    }

    function OpenIcon({ original }) {
        return (
            <CTooltip content="Inspect Pipeline" placement="top">
                <CButton
                    color="info"
                    variant='outline'
                    style={{ marginRight: '5px' }}
                    onClick={() => navigate(`/pipeline/${original.id}`)}
                >
                    <FontAwesomeIcon icon={faEye} />
                </CButton>
            </CTooltip>
        )
    }


    const TemplateDescButton = ({ templates, templName, pipeID }) => {
        const match = templates.find(t => t.name === templName);
        return (
            <HelpButton
                id={`${pipeID}_${match.id}`}
                text={match.description} />
        );
    };
    const tableData = useMemo(() => {
        if (data === undefined) {
            return []
        }
        return [...data.pipes].reverse();
    }, [data]);
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
            const defineColumns = () => {
                const columnHelper = createColumnHelper()

                let columns = []

                columns = [
                    ...columns,
                    columnHelper.accessor('name', {
                        header: 'Name',
                        cell: (props) => {
                            return (
                                <>
                                    <b>{props.row.original.name}</b>
                                    <HelpButton
                                        id={props.row.original.id}
                                        text={props.row.original.description}
                                    />
                                    <div className="small text-muted">
                                        {`ID: ${props.row.original.id}`}
                                    </div>
                                </>)
                        }
                    }),
                    columnHelper.accessor('description', {
                        header: 'Template',
                        cell: (props) => {
                            return (
                                <>
                                    <b>{props.row.original.templateName.split('.')[1]}</b>
                                    <TemplateDescButton
                                        templName={props.row.original.templateName}
                                        templates={templateData.templates}
                                        pipeID={props.row.original.id}
                                    />
                                    <div className="small text-muted">
                                        {props.row.original.templateName.split('.')[0]}
                                    </div>
                                </>
                            )

                        }
                    }),
                    columnHelper.accessor('progress', {
                        header: 'Progress',
                        cell: (props) => {
                            const progress = parseInt(props.row.original.progress)
                            if (props.row.original.progress === 'ERROR') {
                                return (
                                    <div>ERROR</div>
                                )
                            }
                            if (props.row.original.progress === 'PAUSED') {
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
                        }

                    }),
                    columnHelper.accessor('date', {
                        header: 'Started on',
                        cell: (props) =>
                            new Date(props.row.original.date).toLocaleString(),
                        // sortMethod: (date1, date2) => {
                        //     return new Date(date1) > new Date(date2) ? -1 : 1
                        // },
                    }),
                    columnHelper.display({
                        id: 'options',
                        header: 'Options',
                        cell: (props) => {
                            return (
                                <>
                                    {/* <CButtonGroup role="group" aria-label="Basic mixed styles example"> */}
                                    <OpenIcon original={props.row.original} />
                                    <UnPauseButton original={props.row.original} />
                                    <DeleteButton original={props.row.original} />
                                    {/* </CButtonGroup> */}
                                </>
                            )
                        }
                    }),
                ]
                return columns
            }
            // console.log("RENDERING!!!")
            return (
                <CoreDataTable columns={defineColumns()} tableData={tableData} />
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
