import { CContainer } from '@coreui/react'
import { faEye, faPlay, faPause, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import { Progress } from 'reactstrap'
import { usePipelines, usePlayPipeline, usePausePipeline, useDeletePipeline } from '../../../actions/pipeline/pipeline_api'
import BaseContainer from '../../../components/BaseContainer'
import { CenteredSpinner } from '../../../components/CenteredSpinner'
import HelpButton from '../../../components/HelpButton'
import IconButton from '../../../components/IconButton'
import { getColor } from '../../Annotation/AnnoTask/utils'
import '../globalComponents/pipeline.scss'
import { CButton, CButtonGroup } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { alertDeletePipeline } from '../globalComponents/Sweetalert'

export const RunningPipelines = () => {
    const navigate = useNavigate()
    const { data, isError, isLoading } = usePipelines()
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
                color={original.progress === 'PAUSED' ? "success" : "warning"}
                // size="m"
                // isOutline={false}
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
                color={"danger"}
                onClick={() =>
                    deletePipelineHandler(original)
                }
            >
                <FontAwesomeIcon icon={faTrash} />
            </CButton>
        )
    }

    const renderDatatable = () => {
        if (isLoading) {
            return <CenteredSpinner />
        }

        if (isError) {
            return <div className="pipeline-error-message">Error loading data</div>
        }
        if (data) {
            if (data.error) {
                return <div className="pipeline-error-message">{data.error}</div>
            }
            const tableData = data.pipes
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
                            Header: 'Template Name',
                            accessor: 'templateName',
                            Cell: ({ original }) => (
                                <>
                                    <b>{original.templateName.split('.')[1]}</b>
                                    <div className="small text-muted">
                                        {original.templateName.split('.')[0]}
                                    </div>
                                </>
                            ),
                        },
                        {
                            Header: 'Progress',
                            accessor: 'progress',
                            Cell: ({ value, original }) => {
                                const progress = parseInt(value)
                                if (value === 'ERROR') {
                                    return (<>
                                        <div>ERROR</div>
                                        <DeleteButton original={original}/>
                                    </>
                                    )
                                }
                                if (value === 'PAUSED') {
                                    return (
                                        <>
                                            <div>PAUSED</div>
                                            <CButtonGroup role="group" aria-label="Basic mixed styles example">
                                                <UnPauseButton original={original} />
                                                <DeleteButton original={original}/>
                                            </CButtonGroup>
                                        </>
                                    )
                                }
                                return (
                                    <>
                                        <Progress
                                            className="progress-xs rt-progress"
                                            color={getColor(progress)}
                                            value={progress}
                                        />
                                        <CButtonGroup role="group" aria-label="Basic mixed styles example">
                                            <UnPauseButton original={original} />
                                            <DeleteButton original={original}/>
                                        </CButtonGroup>
                                    </>
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
                            Header: 'Details',
                            accessor: 'id',
                            Cell: ({ original }) => (
                                <IconButton
                                    color="primary"
                                    size="m"
                                    isOutline={false}
                                    onClick={() => navigate(`/pipeline/${original.id}`)}
                                    icon={faEye}
                                    text="Open"
                                />
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
