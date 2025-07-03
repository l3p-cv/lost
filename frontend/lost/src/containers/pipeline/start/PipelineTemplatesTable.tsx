import { CContainer } from '@coreui/react'
import { faPlay } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { useTemplates } from '../../../actions/pipeline/pipeline_api'
import BaseContainer from '../../../components/BaseContainer'
import { CenteredSpinner } from '../../../components/CenteredSpinner'
import Datatable from '../../../components/Datatable'
import HelpButton from '../../../components/HelpButton'
import IconButton from '../../../components/IconButton'
import { useEffect, useState } from 'react'
import CoreDataTable from '../../../components/CoreDataTable'
import { createColumnHelper } from '@tanstack/react-table'

export const PipelineTemplatesTable = () => {
    const navigate = useNavigate()
    function navigate2(val) {
        console.log("VAL 1: ", val)
    }
    const { data, isLoading, isError } = useTemplates('all')

    const [siaPipelineId, setSiaPipelineId] = useState(null);

    useEffect(() => {
      if (data?.templates) {
        const siaTemplate = data.templates.find(t => t.name === 'found.sia');
        if (siaTemplate) {
          localStorage.setItem('siaPipelineId', siaTemplate.id);
          setSiaPipelineId(siaTemplate.id);
        }
      }
    }, [data]);


    const defineColumns = () => {
        const columnHelper = createColumnHelper()
        let columns = []
        columns = [
            ...columns,
            columnHelper.accessor('name', {
                header: 'Name/Project',
                cell: (props) => {
                    return (
                        <>
                            <>
                                <b>{props.row.original.name.split('.')[1]}</b>
                                <HelpButton
                                    id={props.row.original.id}
                                    text={props.row.original.description}
                                />
                                <div className="small text-muted">
                                    {`${props.row.original.name.split('.')[0]}`}
                                </div>
                            </>
                        </>)
                }
            }),
            columnHelper.display({
                id: 'start',
                header: 'Start',
                cell: (props) => {
                    return (
                        <IconButton
                          color="primary"
                          size="m"
                          isOutline={false}
                          className={
                              props.row.original.name === 'found.sia'
                                  ? 'sia-start-button'
                                  : props.row.original.name === 'found.mia'
                                  ? 'mia-start-button'
                                  : ''
                          }
                          onClick={() =>
                              navigate(`/pipeline-template/${props.row.original.id}`)
                          }
                          icon={faPlay}
                          text="Start"
                      />
                    )
                }
            })
        ]
        return columns
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

            const templateData = data.templates

            return (
                <CoreDataTable columns={defineColumns()} tableData={templateData} />
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