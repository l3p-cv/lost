import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogout } from '../../actions/auth'
import { CButton, CCard, CCardBody, CCardGroup, CContainer, CRow } from '@coreui/react'

const Logout = () => {
  const navigate = useNavigate()
  const isTimeout = window.location.hash.replace('#', '') === 'timeout'

  const { mutate: logout, isLoading, isError } = useLogout()

  useEffect(() => {
    // don't try to log out if we are already
    if (localStorage.getItem('token') === null) return

    logout(undefined, {
      onSuccess: () => {
        // Clear auth token
        localStorage.removeItem('token')

        // Clear all Joyride/tour-related state
        localStorage.removeItem('currentStep')
        localStorage.removeItem('joyrideRunning')
        localStorage.removeItem('latestPipelineId')
        localStorage.removeItem('hasCompletedTour')
      },
    })
  }, [logout])

  return (
    <div className="app flex-row align-items-center">
      <CContainer>
        <CRow style={{ margin: '10% 0% 5% 0%' }} className="justify-content-center">
          <img src="/assets/lost_logo.png" alt="" style={{ width: '500px' }} />
        </CRow>
        <CRow className="justify-content-center">
          <CCardGroup>
            <CCard className="p-4">
              <CCardBody>
                {isError ? (
                  <div> An error occurred while logging out. </div>
                ) : isLoading ? (
                  <div>Logging out...</div>
                ) : (
                  <div>
                    {isTimeout
                      ? 'Your session has expired due to inactivity'
                      : 'You have been successfully logged out.'}
                    &nbsp;
                  </div>
                )}
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
