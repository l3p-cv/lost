import React from 'react'
import { useNavigate } from 'react-router-dom'
import MIAImage from './NewMIAImage'
import { useFinishMia } from '../../../api/mia'
import { CAlert, CButton, CCol, CRow } from '@coreui/react'
import './Cluster.scss'
import CenteredSpinner from '../../../components/CenteredSpinner'

type ClusterProps = {
  images: [{ id: number; type: string }]
  zoom: number
  workingOnAnnoTask: any
  imagesLoading: boolean
  imageActiveStates: {
    value: Record<number, boolean>
    set: (id: number, active: boolean) => void
  }
}

const Cluster = ({
  images,
  zoom,
  imagesLoading,
  workingOnAnnoTask,
  imageActiveStates,
}: ClusterProps) => {
  const navigate = useNavigate()
  const { mutate: finishMia } = useFinishMia()
  const handleFinish = () => {
    finishMia(undefined, {
      onSuccess: () => {
        // queryClient.invalidateQueries(['workingAnnoTask'])
        navigate('/dashboard')
      },
    })
  }

  const renderFinishTask = () => {
    if (workingOnAnnoTask) {
      const { size, finished } = workingOnAnnoTask
      if (size - finished === 0) {
        return (
          <CRow>
            <CRow className="justify-content-center" style={{ marginTop: '40px' }}>
              <CCol xs="5" className="d-flex">
                <CAlert color="success">
                  No more images available. Please press finish in order to continue the
                  pipeline.
                </CAlert>
              </CCol>
            </CRow>
            <CRow className="justify-content-center">
              <CCol xs="2">
                <CButton color="primary" size="lg" onClick={handleFinish}>
                  <i className="fa fa-check"></i> Finish Task
                </CButton>
              </CCol>
            </CRow>
          </CRow>
        )
      }
    }
    if (!imagesLoading) {
      return (
        <CRow className="justify-content-center" style={{ marginTop: '40px' }}>
          <CCol xs="5" className="d-flex">
            <CAlert color="warning">
              It seems like another user still hase images left to annotate.
            </CAlert>
          </CCol>
        </CRow>
      )
    }

    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div>
          <CenteredSpinner />
        </div>
      </div>
    )
  }

  if (images.length > 0 && !imagesLoading) {
    return (
      <div className="mia-images">
        {images.map((imageData) => {
          const imageActiveState = {
            value: imageActiveStates.value[imageData.id],
            set: imageActiveStates.set,
          }
          return (
            <MIAImage
              key={imageData.id}
              imageBase={imageData}
              height={zoom}
              imageActiveState={imageActiveState}
            ></MIAImage>
          )
        })}
      </div>
    )
  } else {
    return <React.Fragment>{renderFinishTask()}</React.Fragment>
  }
}

export default Cluster
