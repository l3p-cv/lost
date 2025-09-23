import { CContainer, CTooltip, CProgress, CBadge } from '@coreui/react'
import { faEye, faPlay, faPause, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import 'react-table/react-table.css'
import {
    usePipelinesPaged, useTemplates,
    usePausePipeline, usePlayPipeline, useDeletePipeline
} from '../../../actions/pipeline/pipeline_api'
import BaseContainer from '../../../components/BaseContainer'
import { CenteredSpinner } from '../../../components/CenteredSpinner'
import { getColor } from '../../Annotation/AnnoTask/utils'
import '../globalComponents/pipeline.scss'
import { alertDeletePipeline } from '../globalComponents/Sweetalert'
import { useState, useEffect, useMemo } from 'react';
import CoreDataTable from '../../../components/CoreDataTable'
import { createColumnHelper } from '@tanstack/react-table'
import TableHeader from '../../../components/TableHeader'
import CoreIconButton from '../../../components/CoreIconButton'
import ErrorBoundary from '../../../components/ErrorBoundary'

export const RunningPipelines = () => {
    const navigate = useNavigate()
    const [pageSize, setPageSize] = useState(10)
    const [page, setPage] = useState(0)
    const [pageCount, setPageCount] = useState(0)
    const [lastRequestedPage, setLastRequestedPage] = useState(0)
    const [datatableInfo, setDatatableInfo] = useState()
    const [pipelineData, setPipelineData] = useState(null)
    const [latestPipelineId, setLatestPipelineId] = useState(null)

    const { data, isError, isLoading } = usePipelinesPaged(page, pageSize)
    const {
        data: templateData,
        isLoading: templateIsLoading,
        isError: templateIsError
    } = useTemplates('all')

    const { mutate: pausePipeline } = usePausePipeline()
    const { mutate: playPipeline } = usePlayPipeline()
    const { mutate: deletePipeline } = useDeletePipeline()

    const pausePipelineHandler = (data) => pausePipeline(data.id)
    const playPipelineHandler = (data) => playPipeline(data.id)
    const deletePipelineHandler = async (data) => {
        const response = await alertDeletePipeline()
        if (response.value) deletePipeline(data.id)
    }

    useEffect(() => {
        if (data && page === lastRequestedPage) {
            const pipes = data.pipelines.pipes
            console.log('Updating pipelineData:', pipes);
            setPageCount(data.pages)
            setPipelineData(pipes)

            if (pipes && pipes.length > 0) {
                const latestPipeline = pipes.reduce((latest, current) =>
                    new Date(current.date) > new Date(latest.date) ? current : latest,
                    pipes[0]
                )
                const latestId = latestPipeline?.id
                setLatestPipelineId(latestId)

                const joyrideRunning = localStorage.getItem('joyrideRunning') === 'true'
                const currentStep = parseInt(localStorage.getItem('currentStep') || '0')
                if (joyrideRunning && currentStep === 28) {
                    localStorage.setItem('latestPipelineId', latestId)
                    window.dispatchEvent(new CustomEvent('joyride-next-step', {
                        detail: { step: 'latest-running-pipeline' },
                    }))
                }
            } else {
                setLatestPipelineId(null); 
            }
        }
    }, [data, lastRequestedPage])

    useEffect(() => {
        if (datatableInfo) {
            setPageSize(datatableInfo.pageSize)
            setPage(datatableInfo.page)
        }
    }, [datatableInfo])

    const UnPauseButton = ({ original }) => (
            <CoreIconButton
                toolTip={original.progress === 'PAUSED' ? "Activate Pipeline" : "Pause Pipeline"}
                color={original.progress === 'PAUSED' ? "success" : "warning"}
                variant='outline'
                disabled={original.progress === 'ERROR' || original.progress === '100%'}
                style={{ marginRight: '5px' }}
                onClick={() =>
                    original.progress === 'PAUSED'
                        ? playPipelineHandler(original)
                        : pausePipelineHandler(original)
                }
                icon={original.progress === 'PAUSED' ? faPlay : faPause}
            />
    )

    const DeleteButton = ({ original }) => (
            <CoreIconButton
                toolTip='Delete Pipeline'
                color="danger"
                variant='outline'
                onClick={() => deletePipelineHandler(original)}
                icon={faTrash}
            />
    )

    const OpenIcon = ({ original }) => (
            <CoreIconButton
                toolTip='Inspect Pipeline'
                color="info"
                variant='outline'
                style={{ marginRight: '5px' }}
                onClick={() => {
                    const currentStep = parseInt(localStorage.getItem('currentStep')||'0');
                    const isJoyrideRunning = localStorage.getItem('joyrideRunning') === 'true';
                    console.log('OpenIcon clicked, currentStep:', currentStep, 'it will be made',currentStep + 1);
                    if(isJoyrideRunning && (currentStep === 42 || currentStep === 14)){
                        window.dispatchEvent(new CustomEvent('joyride-next-step', {detail: { step: 'view-created-pipeline' }}));
                    }
                    localStorage.setItem('latestPipelineId', String(original.id));
                    navigate(`/pipeline/${original.id}`);
                }}
                className={original.id === latestPipelineId ? 'latest-pipeline-open-button' : ''}
                icon={faEye}
            />
    )

    const getTemplateDescription = ({ templates, templName }) => {
        const match = templates?.find(t => t?.name === templName)
        return match?.description
    }

    const getRowClassName = (original) => {
        return original.id === latestPipelineId ? 'latest-pipeline-row' : ''
    }
   
    const navigateToTemplates = () => {
        navigate('/pipeline-templates')
    }
    
    const defineColumns = () => {
        const columnHelper = createColumnHelper()
        return [
            columnHelper.accessor('name', {
                header: 'Name',
                cell: (props) => (
                    <div>
                        <CTooltip content={props.row.original.description} placement="top">
                            <b style={{ textDecoration: 'grey dotted underline'}}>{props.row.original.name}</b>
                        </CTooltip>
                        <div className="small text-muted">
                            {`ID: ${props.row.original.id}`}
                        </div>
                    </div>
                )
            }),
            columnHelper.accessor('description', {
                header: 'Template',
                cell: (props) => {
                    return (
                    <>
                        <CTooltip 
                            content={getTemplateDescription({
                                templates: templateData?.templates,
                                templName: props.row.original.templateName})}
                            placement="top"
                        >
                            <b style={{ textDecoration: 'grey dotted underline'}}>{props.row.original.templateName.split('.')[1]}</b>
                        </CTooltip>
                        <div className="small text-muted">
                            {props.row.original.templateName.split('.')[0]}
                        </div>
                    </>
                )}
            }),
            columnHelper.accessor('progress', {
                header: 'Progress',
                cell: (props) => {
                    const progress = parseInt(props.row.original.progress)
                    if (props.row.original.progress === 'ERROR') return <CBadge color='danger'>ERROR</CBadge>
                    if (props.row.original.progress === 'PAUSED') return <CBadge color='warning'>PAUSED</CBadge>
                    return (
                        <CProgress
                            className="progress-xs rt-progress"
                            color={getColor(progress)}
                            value={progress}
                        />
                    )
                }
            }),
            columnHelper.accessor('date', {
                header: 'Started on',
                cell: ({ row }) => new Date(row.original.date).toLocaleString(),
            }),
            columnHelper.display({
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <>
                        <OpenIcon original={row.original} />
                        <UnPauseButton original={row.original} />
                        <DeleteButton original={row.original} />
                    </>
                )
            })
        ]
    }

    const columns = useMemo(() => defineColumns(), [pipelineData, templateData])

    const renderDatatable = () => {
        if ((isLoading || templateIsLoading) && !pipelineData) return <CenteredSpinner />
        if (isError || templateIsError) return <div className="pipeline-error-message">Error loading data</div>
        if (pipelineData) {
            if ((data && templateData) && (data.pipelines.error || templateData.error)) {
                return <div className="pipeline-error-message">{data.pipelines.error}</div>
            }
            return (
                <ErrorBoundary>
                <CoreDataTable
                    // key={pipelineData.length}
                    columns={columns}
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
                    getRowClassName={getRowClassName}
                />
                </ErrorBoundary>
            )
        }
    }

    return (
        <CContainer style={{ marginTop: '15px' }}>
            <TableHeader
                headline="Pipelines"
                buttonStyle={{ marginTop: 15, marginBottom: 20 }}
                icon={faPlay}
                buttonText='Start new Pipeline'
                onClick={navigateToTemplates}
            />
            <BaseContainer>
                <div className="pipeline-running-1">{renderDatatable()}</div>
            </BaseContainer>
        </CContainer>
    )
}