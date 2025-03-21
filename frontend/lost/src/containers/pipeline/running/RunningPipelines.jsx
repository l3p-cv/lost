import { CContainer } from '@coreui/react'
import { faEye } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import { Progress } from 'reactstrap'
import { usePipelines } from '../../../actions/pipeline/pipeline_api'
import BaseContainer from '../../../components/BaseContainer'
import { CenteredSpinner } from '../../../components/CenteredSpinner'
import HelpButton from '../../../components/HelpButton'
import IconButton from '../../../components/IconButton'
import { getColor } from '../../Annotation/AnnoTask/utils'
import '../globalComponents/pipeline.scss'

export const RunningPipelines = () => {
    const navigate = useNavigate()
    const { data, isError, isLoading } = usePipelines()

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
                            Cell: ({ original }) => <b>{original.name}</b>,
                        },
                        {
                            Header: 'Description',
                            accessor: 'description',
                            Cell: ({ original }) => (
                                <HelpButton
                                    id={original.id}
                                    text={original.description}
                                />
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
                            Cell: ({ value }) => {
                                const progress = parseInt(value)
                                if (value === 'ERROR') {
                                    return <div>ERROR</div>
                                }
                                if (value === 'PAUSED') {
                                    return <div>PAUSED</div>
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
                            Header: 'Start',
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
                    defaultSorted={[
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
