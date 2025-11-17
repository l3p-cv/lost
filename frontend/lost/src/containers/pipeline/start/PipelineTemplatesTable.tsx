import { CContainer, CTooltip } from '@coreui/react'
import { faPlay } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { useTemplates } from '../../../actions/pipeline/pipeline_api'
import BaseContainer from '../../../components/BaseContainer'
import { CenteredSpinner } from '../../../components/CenteredSpinner'
import HelpButton from '../../../components/HelpButton'
import IconButton from '../../../components/IconButton'
import { useEffect, useState } from 'react'
import CoreDataTable from '../../../components/CoreDataTable'
import { createColumnHelper } from '@tanstack/react-table'
import TableHeader from '../../../components/TableHeader'
import CoreIconButton from '../../../components/CoreIconButton'
import ErrorBoundary from '../../../components/ErrorBoundary'

export const PipelineTemplatesTable = () => {
  const navigate = useNavigate()
  function navigate2(val) {
    console.log('VAL 1: ', val)
  }
  const { data, isLoading, isError } = useTemplates('all')

  const [siaPipelineId, setSiaPipelineId] = useState(null)

  useEffect(() => {
    if (data?.templates) {
      const siaTemplate = data.templates.find((t) => t.name === 'found.sia')
      if (siaTemplate) {
        localStorage.setItem('siaPipelineId', siaTemplate.id)
        setSiaPipelineId(siaTemplate.id)
      }
    }
  }, [data])

  const defineColumns = () => {
    const columnHelper = createColumnHelper()
    let columns = []
    columns = [
      columnHelper.accessor('name', {
        header: 'Name/Project',
        cell: (props) => {
          return (
            <>
              <CTooltip content={props.row.original.description} placement="top">
                <b style={{ textDecoration: 'grey dotted underline' }}>
                  {props.row.original.name.split('.')[1]}
                </b>
              </CTooltip>
              <div className="small text-muted">
                {`${props.row.original.name.split('.')[0]}`}
              </div>
            </>
          )
        },
      }),
      columnHelper.display({
        id: 'start',
        header: 'Start',
        cell: ({ row }) => {
          return (
            <>
              <CoreIconButton
                color="primary"
                text=" Start Pipeline"
                className={
                  row.original.name === 'found.sia'
                    ? 'sia-start-button'
                    : row.original.name === 'found.mia'
                      ? 'mia-start-button'
                      : ''
                }
                onClick={() => {
                  if (row.original.name) {
                    const joyrideRunning =
                      localStorage.getItem('joyrideRunning') === 'true'
                    const currentStep = parseInt(
                      localStorage.getItem('currentStep') || '0',
                    )
                    if (joyrideRunning && currentStep === 1) {
                      window.dispatchEvent(
                        new CustomEvent('joyride-next-step', {
                          detail: { step: 'navigate-to-template' },
                        }),
                      )
                    }
                  }
                  navigate(`/pipeline-template/${row.original.id}`)
                }}
                icon={faPlay}
              />
            </>
          )
        },
      }),
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

      setTimeout(() => {
        const joyrideRunning = localStorage.getItem('joyrideRunning') === 'true'
        const currentStep = parseInt(localStorage.getItem('currentStep') || '0')
        if (joyrideRunning && currentStep === 0) {
          window.dispatchEvent(
            new CustomEvent('joyride-next-step', {
              detail: { step: 'skip-navigate' },
            }),
          )
        }
      }, 3000)
      return (
        <ErrorBoundary>
          <CoreDataTable columns={defineColumns()} tableData={templateData} />
        </ErrorBoundary>
      )
    }
  }

  return (
    <CContainer style={{ marginTop: '15px' }}>
      {/* <h3 className="card-title mb-3" style={{ textAlign: 'center' }}>
                Pipeline Templates
            </h3> */}
      <TableHeader
        headline="Pipeline Templates"
        buttonStyle={{ marginTop: 15, marginBottom: 20, visibility: 'hidden' }}
        buttonText="Add Instruction"
      />
      <BaseContainer>
        <div className="pipeline-start-1">{renderDatatable()}</div>
      </BaseContainer>
    </CContainer>
  )
}
