import React from 'react'
import { CButton } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'

const TourTriggerButton = ({ onStartTour }) => {
  return (
    <CButton color="link" onClick={onStartTour} title="Start Tour">
      <FontAwesomeIcon icon={faInfoCircle} />
    </CButton>
  )
}

export default TourTriggerButton
