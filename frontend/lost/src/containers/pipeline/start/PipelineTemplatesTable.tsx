import { CContainer } from '@coreui/react'
import { faPlay } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { useTemplates } from '../../../actions/pipeline/pipeline_api'
import BaseContainer from '../../../components/BaseContainer'
import { CenteredSpinner } from '../../../components/CenteredSpinner'
import Datatable from '../../../components/Datatable'
import HelpButton from '../../../components/HelpButton'
import IconButton from '../../../components/IconButton'

export const PipelineTemplatesTable = () => {
    const navigate = useNavigate()
    const { data, isLoading, isError } = useTemplates('all')

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

            const templateData = data.templates

            return (
                <Datatable
                    columns={[
                        {
                            Header: 'Name / Project',
                            accessor: 'name',
                            Cell: (row) => (
                                <>
                                    <b>{row.original.name.split('.')[1]}</b>
                                    <div className="small text-muted">
                                        {`${row.original.name.split('.')[0]}`}
                                    </div>
                                </>
                            ),
                        },
                        {
                            Header: 'Description',
                            accessor: 'description',
                            Cell: (row) => (
                                <HelpButton
                                    id={row.original.id}
                                    text={row.original.description}
                                />
                            ),
                        },
                        {
                            Header: 'Start',
                            accessor: 'id',
                            Cell: (row) => (
                                <IconButton
                                    color="primary"
                                    size="m"
                                    isOutline={false}
                                    onClick={() =>
                                        navigate(`/pipeline-template/${row.value}`)
                                    }
                                    icon={faPlay}
                                    text="Start"
                                />
                            ),
                        },
                    ]}
                    data={templateData}
                    defaultPageSize={10}
                    className="-striped -highlight"
                />
            )
        }
    }

    return (
        <CContainer style={{ marginTop: '15px' }}>
            <h3 className="card-title mb-3" style={{ textAlign: 'center' }}>
                Pipeline Templates
            </h3>
            <BaseContainer>
                <div className="pipeline-start-1">{renderDatatable()}</div>
            </BaseContainer>
        </CContainer>
    )
}
