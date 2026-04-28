import React from 'react'
import TourStartTable from '../../../containers/pipeline/TourStartTable'
import BaseModal from '../../BaseModal'

type TourModalProps = {
  isVisible: boolean
  onClose: () => void
  onStartTour: (arg1: string) => void
}

const TourModal = ({ isVisible, onClose, onStartTour }: TourModalProps) => {
  const handleCancel = () => {
    localStorage.removeItem('joyrideRunning')
    onClose()
  }

  return (
    <BaseModal
      title="Welcome to the Tour"
      isOpen={isVisible}
      onClosed={handleCancel}
      backdropOption="static"
      size="lg"
      isShowCancelButton
      toggle={handleCancel}
    >
      <p className="mb-4 text-center">
        This is a guided tour of the available features. Select an option below to learn
        more and start the tour.
      </p>
      <TourStartTable onStartTour={onStartTour} />
    </BaseModal>
  )
}

export default TourModal
