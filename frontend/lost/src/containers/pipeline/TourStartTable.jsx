import { useLocation } from 'react-router-dom'
import { CContainer } from '@coreui/react'
import { faPlay } from '@fortawesome/free-solid-svg-icons'
import { useTemplates } from '../../actions/pipeline/pipeline_api'
import BaseContainer from '../../components/BaseContainer'
import { CenteredSpinner } from '../../components/CenteredSpinner'
import HelpButton from '../../components/HelpButton'
import { useEffect, useState } from 'react'
import CoreDataTable from '../../components/CoreDataTable'
import { createColumnHelper } from '@tanstack/react-table'
import CoreIconButton from '../../components/CoreIconButton'
import InfoText from '../../components/InfoText'

const TourStartTable = ({ onStartTour }) => {
  const { data, isLoading, isError } = useTemplates('all')
  const [pipelines, setPipelines] = useState([])
  const location = useLocation()

  useEffect(() => {
    if (data?.templates) {
      const foundSia = data.templates.find((t) => t.name === 'found.sia')
      const foundMia = data.templates.find((t) => t.name === 'found.mia')
      let newPipelines = []

      if (location.pathname === '/dashboard') {
        if (foundSia) {
          localStorage.setItem('siaPipelineId', foundSia.id)
          newPipelines.push({ ...foundSia, tourType: 'mainPipeline', label: 'SIA' })
        }
        if (foundMia) {
          localStorage.setItem('miaPipelineId', foundMia.id)
          newPipelines.push({ ...foundMia, tourType: 'miaPipeline', label: 'MIA' })
        }
        newPipelines.push({
          id: 'instructionTour',
          label: 'Instructions',
          description: 'Learn how to create, view, and edit instructions.',
          tourType: 'instructionTour',
        })
        newPipelines.push({
          id: 'labelTour',
          label: 'Labels',
          description: 'Learn how to label data in a pipeline.',
          tourType: 'labelTour',
        })
      } else if (location.pathname === '/pipeline-templates') {
        if (foundSia) {
          localStorage.setItem('siaPipelineId', foundSia.id)
          newPipelines.push({ ...foundSia, tourType: 'mainPipeline', label: 'SIA' })
        }
        if (foundMia) {
          localStorage.setItem('miaPipelineId', foundMia.id)
          newPipelines.push({ ...foundMia, tourType: 'miaPipeline', label: 'MIA' })
        }
      } else if (location.pathname === '/labels') {
        newPipelines.push({
          id: 'labelTour',
          label: 'Labels',
          description: 'Learn how to label data in a pipeline.',
          tourType: 'labelTour',
        })
      } else if (location.pathname === '/instructions') {
        newPipelines.push({
          id: 'instructionTour',
          label: 'Instructions',
          description: 'Learn how to create, view, and edit instructions.',
          tourType: 'instructionTour',
        })
      }

      setPipelines(newPipelines)
    }
  }, [data, location.pathname])

  if (isLoading) return <CenteredSpinner />
  if (isError) return <div>Error loading pipeline templates</div>
  if (pipelines.length === 0)
    return (
      <CContainer style={{ marginTop: '15px' }}>
        <BaseContainer>
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: '150px' }}
          >
            <h5 className="text-muted">
              No tours are available on this page. Please visit the Dashboard to start a
              guided tour.
            </h5>
          </div>
        </BaseContainer>
      </CContainer>
    )

  const columnHelper = createColumnHelper()
  const columns = [
    columnHelper.accessor('label', {
      header: 'Name / Project',
      cell: (props) => {
        return (
          <InfoText
            text={props.row.original.label}
            subText={props.row.original.tourType}
            toolTip={props.row.original.description}
          />
        )
      },
    }),
    columnHelper.accessor('id', {
      header: 'Start Tour',
      cell: (props) => {
        return (
          <CoreIconButton
            icon={faPlay}
            text="Start Tour"
            color="primary"
            onClick={() => onStartTour(props.row.original.tourType)}
          />
        )
      },
    }),
  ]

  return (
    <BaseContainer>
      <CoreDataTable
        columns={columns}
        tableData={pipelines}
        pageSize={3}
        style={{ marginTop: '15px' }}
      />
    </BaseContainer>
  )
}

export default TourStartTable
