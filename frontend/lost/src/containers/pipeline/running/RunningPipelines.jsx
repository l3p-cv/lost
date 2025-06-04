import { CContainer } from '@coreui/react'
import { faEye, faPlay, faPause, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import 'react-table/react-table.css'
import { Progress } from 'reactstrap'
import {
    usePipelines, usePlayPipeline, usePausePipeline, useDeletePipeline,
    useTemplates, usePipelinesPaged
} from '../../../actions/pipeline/pipeline_api'
import BaseContainer from '../../../components/BaseContainer'
import { CenteredSpinner } from '../../../components/CenteredSpinner'
import HelpButton from '../../../components/HelpButton'
import { getColor } from '../../Annotation/AnnoTask/utils'
import '../globalComponents/pipeline.scss'
import { CButton, CButtonGroup, CTooltip } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { alertDeletePipeline } from '../globalComponents/Sweetalert'
import { useState, useEffect } from 'react';
import CoreDataTable from '../../../components/CoreDataTable'
import { createColumnHelper } from '@tanstack/react-table'

export const RunningPipelines = () => {
    const navigate = useNavigate()
    // const { data, isError, isLoading } = usePipelines()
    const [pageSize, setPageSize] = useState(10)
    const [page, setPage] = useState(0)
    const [pageCount, setPageCount] = useState(0) //(null)
    const [lastRequestedPage, setLastRequestedPage] = useState(0)
    const [datatableInfo, setDatatableInfo] = useState()
    const [pipelineData, setPipelineData] = useState(null)
    const { data, isError, isLoading } = usePipelinesPaged(page, pageSize)
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

    useEffect(() => {
        if (data && page === lastRequestedPage) {
            setPageCount(data.pages)
            setPipelineData(data.pipelines.pipes)
        }
    }, [data, lastRequestedPage])

    useEffect(() => {
        if (datatableInfo) {
            setPageSize(datatableInfo.pageSize)
            setPage(datatableInfo.page)
        }
    }, [datatableInfo])

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
                        return (<div>ERROR</div>)
                    }
                    if (props.row.original.progress === 'PAUSED') {
                        return (<div>PAUSED</div>)
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
                cell: ({ row }) =>
                    new Date(row.original.date).toLocaleString(),
                // sortMethod: (date1, date2) => {
                //     return new Date(date1) > new Date(date2) ? -1 : 1
                // },
            }),
            columnHelper.display({
                id: 'options',
                header: 'Options',
                cell: ({ row }) => {
                    return (
                        <>
                            {/* <CButtonGroup role="group" aria-label="Basic mixed styles example"> */}
                            <OpenIcon original={row.original} />
                            <UnPauseButton original={row.original} />
                            <DeleteButton original={row.original} />
                            {/* </CButtonGroup> */}
                        </>
                    )
                }
            }),
        ]
        return columns
    }

    const renderDatatable = () => {
        if ((isLoading || templateIsLoading) && !pipelineData) {
            return <CenteredSpinner />
        }

        if (isError || templateIsError) {
            return <div className="pipeline-error-message">Error loading data</div>
        }
        if (pipelineData) {
            if ((data && templateData) && (data.pipelines.error || templateData.error)) {
                return <div className="pipeline-error-message">{data.pipelines.error}</div>
            }
            if (!data && !pipelineData) {
                return <CenteredSpinner />
            }
            return (
                <CoreDataTable
                    columns={defineColumns()}
                    tableData={pipelineData}
                    onPaginationChange={(table) => {
                        const nextPage = table.getState().pagination.pageIndex
                        setLastRequestedPage(nextPage)
                        const tableState = table.getState()
                        setDatatableInfo({
                            pageSize: tableState.pagination.pageSize,
                            page: tableState.pagination.pageIndex,
                            sorted: tableState.sorting,
                            filtered: tableState.columnFilters,
                        })
                    }}
                    pageIndex={page}
                    pageCount={pageCount}
                    wholeData={false}
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
