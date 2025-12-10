// The Top bar for every annotation-view
import React, { useState, useEffect } from 'react'
import { getColor } from './utils'
import { useGetInstructions } from '../../Instruction/instruction_api' // API hook for instructions
import { useGetCurrentInstruction } from '../../../actions/annoTask/anno_task_api' // Fetch current instruction
import ViewInstruction from '../../Instruction/ViewInstruction' // Import ViewInstruction component
import CoreIconButton from '../../../components/CoreIconButton'
import { CCol, CContainer, CProgress, CRow, CTooltip } from '@coreui/react'
import { faCrown, faEye } from '@fortawesome/free-solid-svg-icons'

// TODO: use image (gotten by siaAPI)
const AnnotationTop = ({
  annoTask,
  annoData = null,
  isSIA = true,
  isReview = false,
  datasetId = null,
}) => {
  const [viewingInstruction, setViewingInstruction] = useState(null) // State to hold the current instruction data
  const [toolbarExpertMode, setToolbarExpertMode] = useState(false) // State to hold the current toolbar mode (expert | regular)
  const { data: instructions, isLoading, error } = useGetInstructions('all') // API hook to fetch instructions
  const { data: currentInstruction } = useGetCurrentInstruction(annoTask?.id) // Fetch current instruction based on annoTask.id
  const [selectedInstruction, setSelectedInstruction] = useState(null)

  useEffect(() => {
    if (!instructions) return

    if (currentInstruction?.instruction_id) {
      const inst = instructions.find(
        (i) => String(i.id) === String(currentInstruction.instruction_id),
      )
      if (inst) setSelectedInstruction(inst)
    } else {
      const fallback = instructions.find((i) => i.option === 'Bounding Box')
      if (fallback) setSelectedInstruction(fallback)
    }
  }, [currentInstruction?.instruction_id, instructions])

  const handleViewInstruction = () => {
    setViewingInstruction(selectedInstruction)
  }

  if (!annoTask) {
    return <div>Loading annotation task data...</div>
  }

  const progress = Math.floor((annoTask.finished / annoTask.size) * 100)
  // HACK: stil some inconsistent naming in the apis...
  const pipelineName = annoTask?.pipelineName ?? annoTask?.pipeline_name
  const createdAt = annoTask?.createdAt ?? annoTask?.created_at

  console.log('AannoTask: ', annoTask)

  return (
    <CContainer fluid>
      <CRow className="justify-content-center" style={{ marginTop: '20px' }}>
        <CCol
          style={{
            background: 'white',
            padding: 6,
            borderRadius: 10,
            border: '1px solid rgba(9, 47, 56, 0.16)',
            marginRight: '15px',
          }}
        >
          <CRow>
            <CCol xl="2">
              {/* <div className="callout callout-primary"> */}
              <div className="clearfix">
                <div className="float-left">
                  <small className="text-muted">Task Progress</small>
                  <br />
                  <strong className="h4">
                    {/* {annoTask.finished}/{annoTask.size} = {progress}% */}
                    {progress}%
                  </strong>
                  {!!isReview && (
                    <>
                      <br />
                      <small className="text-muted">
                        {annoTask.finished}/{annoTask.size} Images
                      </small>
                    </>
                  )}
                </div>
              </div>
              {/* </div> */}
            </CCol>
            <CCol xl="2">
              <small className="text-muted">
                {isSIA ? 'Current Image' : 'Labeled Images'}
              </small>
              <br />
              <strong className="h4">
                {isSIA
                  ? `${annoData?.image.number}/${annoData?.image.amount}`
                  : `${annoTask.finished}/${annoTask.size}`}
              </strong>
            </CCol>
            <CCol>
              {/* <div className="callout callout-primary"> */}
              <CRow>
                {/* <div className="callout callout-danger"> */}
                <small className="text-muted">Annotation Task</small>
                <br />
                {/* <strong>{annoTask.name}</strong> */}
                <CTooltip content={`ID: ${annoTask.id}`} placement="top">
                  <strong
                    className="h4"
                    style={{ textDecoration: 'grey dotted underline' }}
                  >
                    {annoTask.name}
                  </strong>
                </CTooltip>
                {/* </div> */}
              </CRow>
              {/* </div> */}
            </CCol>
            {/* <div className="callout callout-info"> */}
            <CCol>
              {/* <div className="callout callout-primary"> */}
              <small className="text-muted">Pipeline</small>
              <br />
              <strong className="h4">{pipelineName}</strong>
              {/* </div> */}
            </CCol>
            {datasetId && (
              <CCol xl="1">
                {/* <div className="callout callout-primary"> */}
                <small className="text-muted">Dataset ID</small>
                <br />
                <strong className="h4">{datasetId}</strong>
                {/* </div> */}
              </CCol>
            )}
          </CRow>
          {!isReview && (
            <CRow>
              <CCol xs="12" md="12" xl="12">
                <CProgress
                  className="progress-xs"
                  color={getColor(progress)}
                  value={progress}
                />
                <div className="float-right">
                  <small className="text-muted">
                    Started at: {new Date(createdAt).toLocaleString()}
                  </small>
                </div>
              </CCol>
            </CRow>
          )}
        </CCol>
        {/* <CCol xs="1" /> */}
        <CCol xs="2" md="2" xl="2" className="d-flex flex-column justify-content-between">
          <CoreIconButton
            color="primary"
            style={{ marginTop: isReview ? '0px' : '10px' }}
            onClick={handleViewInstruction}
            text={'Show Instructions'}
            icon={faEye}
          />
          <CoreIconButton
            color={toolbarExpertMode ? 'warning' : 'primary'}
            isOutline={toolbarExpertMode ? false : true}
            style={{ marginBottom: isReview ? '0px' : '10px' }}
            onClick={() => setToolbarExpertMode(!toolbarExpertMode)} // TODO
            text={toolbarExpertMode ? 'Advanced Mode' : 'Basic Mode'}
            icon={faCrown}
          />
        </CCol>
      </CRow>
      {viewingInstruction && (
        <ViewInstruction
          instructionData={viewingInstruction}
          onClose={() => setViewingInstruction(null)}
        />
      )}
    </CContainer>
  )
}

export default AnnotationTop
