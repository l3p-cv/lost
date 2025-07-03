
import React from 'react';
import { CButton } from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { useLocation } from 'react-router-dom';

const TourTriggerButton = ({ onStartTour }) => {
  const location = useLocation();

  if (location.pathname !== '/dashboard') {
    return null;
  }

  return (
    <CButton
      color="link"
      onClick={onStartTour}
      style={{ position: 'absolute', top: 13, right: 150, zIndex: 9999 }}
      title="Start Tour"
    >
      <FontAwesomeIcon icon={faInfoCircle} />
    </CButton>
  );
};

export default TourTriggerButton;