import React from 'react'
import { CModal, CModalHeader, CModalBody, CModalFooter, CButton } from '@coreui/react'
import TourStartTable from '../../../containers/pipeline/TourStartTable'

const TourModal = ({ isVisible, onClose, onStartTour }) => {
  const handleCancel = () => {
    localStorage.removeItem('joyrideRunning')
    onClose()
  }

  return (
    <CModal visible={isVisible} onClose={onClose} backdrop="static" size="lg">
      <CModalHeader>
        <h5>Welcome to the Tour</h5>
      </CModalHeader>
      <CModalBody>
        <p className="mb-4 text-center">
          This is a guided tour of the available features. Select an option below to learn
          more and start the tour.
        </p>
        <TourStartTable onStartTour={onStartTour} />
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={handleCancel}>
          Cancel
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default TourModal
