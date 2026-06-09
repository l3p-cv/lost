import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogout } from '../../api/auth/auth'
import { CButton, CCard, CCardBody, CCardGroup, CContainer, CRow } from '@coreui/react'

const Logout = () => {
  const navigate = useNavigate()
  const urlHash = globalThis.location.hash.replace('#', '')
  const isInactivity = ['timeout', 'inactivity'].includes(urlHash)

  const { mutateAsync: logout } = useLogout()

  // Use local state instead of useMutation's isLoading/isError
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  let logoutText = 'You have been successfully logged out.'
  if (isInactivity) logoutText = 'Your session has expired due to inactivity'
  if (isError) logoutText = 'An error occurred while logging out.'

  useEffect(() => {
    // don't try to log out if we are already
    if (
      localStorage.getItem('token') === null &&
      localStorage.getItem('refreshToken') === null
    )
      return

    // Clear localStorage immediately
    // Clear auth token
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')

    // Clear all Joyride/tour-related state
    localStorage.removeItem('currentStep')
    localStorage.removeItem('joyrideRunning')
    localStorage.removeItem('latestPipelineId')
    localStorage.removeItem('hasCompletedTour')

    setIsLoading(true)
    logout()
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="app flex-row align-items-center">
      <CContainer>
        <CRow style={{ margin: '10% 0% 5% 0%' }} className="justify-content-center">
          <img src="/assets/lost_logo.png" alt="" style={{ width: '500px' }} />
        </CRow>
        <CRow className="justify-content-center">
          <CCardGroup style={{ maxWidth: '800px', alignItems: 'center' }}>
            <CCard className="p-4">
              <CCardBody>
                {logoutText}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <CButton
                    disabled={isLoading}
                    style={{ marginTop: '5%' }}
                    color="primary"
                    onClick={() => navigate('/login')}
                  >
                    Back to login page!
                  </CButton>
                </div>
              </CCardBody>
            </CCard>
          </CCardGroup>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Logout
