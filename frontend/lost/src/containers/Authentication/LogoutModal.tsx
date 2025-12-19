import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from '@coreui/react'

type LogoutModalProps = {
  remainingSeconds: number
}

const LogoutModal = ({ remainingSeconds }: LogoutModalProps) => {
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = `${remainingSeconds % 60}`.padStart(2, '0')

  return (
    <CModal visible={true} alignment="center">
      <CModalHeader>
        <CModalTitle>Inactivity detected</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p>You have been inactive for a while.</p>
        <p>
          For your security, you will be logged out in {minutes}:{seconds}.
        </p>
        <p>Move your mouse or press the button below to stay logged in.</p>
      </CModalBody>
      <CModalFooter>
        <CButton color="primary">Stay logged in</CButton>
      </CModalFooter>
    </CModal>
  )
}

export default LogoutModal
