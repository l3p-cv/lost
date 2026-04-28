import { CTooltip, CBadge, CRow, CCol } from '@coreui/react'
import { useLocation } from 'react-router-dom'
import { CContainer } from '@coreui/react'
import { faPlay } from '@fortawesome/free-solid-svg-icons'
import { useTemplates } from '../../actions/pipeline/pipeline_api'
import BaseContainer from '../../components/BaseContainer'
import { CenteredSpinner } from '../../components/CenteredSpinner'
import { useEffect, useState } from 'react'
import CoreDataTable from '../../components/CoreDataTable'
import { createColumnHelper } from '@tanstack/react-table'
import CoreIconButton from '../../components/CoreIconButton'
import InfoText from '../../components/InfoText'

const TourStartTable = ({ onStartTour }) => {
  const { data, isLoading, isError } = useTemplates('all')
  const [pipelines, setPipelines] = useState([])
  const location = useLocation()
  const TOUR_PRIORITY = {
    '/instructions': ['instructionTour'],
    '/labels': ['labelTour'],
    '/pipeline-templates': ['mainPipeline', 'miaPipeline'],
    '/pipelines': ['mainPipeline', 'miaPipeline'],
    '/annotation': ['mainPipeline', 'miaPipeline'],
    '/sia': ['mainPipeline'],
    '/mia': ['miaPipeline'],
  }
  const preferredTours =
    location.pathname in TOUR_PRIORITY ? TOUR_PRIORITY[location.pathname] : []

  useEffect(() => {
    if (data?.templates) {
      const foundSia = data.templates.find((t) => t.name === 'found.sia')
      const foundMia = data.templates.find((t) => t.name === 'found.mia')
      let newPipelines = []

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

      newPipelines.sort((a, b) => {
        let includesA = preferredTours.includes(a.tourType)
        let includesB = preferredTours.includes(b.tourType)
        if (includesA && includesB) return 0
        if (includesA) return -1
        if (includesB) return 1
        return 0 // keep original order for the rest
      })

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
          <CRow className="justify-content-center align-items-center">
            <CCol xs="1"></CCol>
            <CCol xs="4">
              <InfoText
                text={props.row.original.label}
                toolTip={props.row.original.description}
              />
            </CCol>
            <CCol xs="1" className="justify-content-end">
              {preferredTours.includes(props.row.original.tourType) && (
                <CTooltip content={`Recommended for this page`}>
                  <CBadge color="success">★</CBadge>
                </CTooltip>
              )}
            </CCol>
          </CRow>
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
        pageSize={5}
        style={{ marginTop: '15px' }}
        // getRowClassName={(row) =>
        //   preferredTours.includes(row.tourType) ? 'table-success' : ''
        // }
      />
    </BaseContainer>
  )
}

export default TourStartTable
