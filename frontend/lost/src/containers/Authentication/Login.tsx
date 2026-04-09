import {
  CCardBody,
  CCardGroup,
  CRow,
  CCol,
  CCard,
  CButton,
  CForm,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CContainer,
  CSpinner,
} from '@coreui/react'
import { useEffect, useState } from 'react'
import { FaLock, FaUser } from 'react-icons/fa'
import CenteredSpinner from '../../components/CenteredSpinner'
import { useLogin } from '../../actions/auth/auth_api'
import { useNavigate } from 'react-router-dom'
import { showError } from '../../components/Notification'
import CoreIconButton from '../../components/CoreIconButton'
import { faFingerprint } from '@fortawesome/free-solid-svg-icons'
import { API_URL } from '../../lost_settings'

// show OpenID button only when an IDP name is configured using VITE_DAISY_OPENID_NAME.
const _oidcName = import.meta.env.VITE_LOST_OPENID_NAME

const Login = () => {
  const navigate = useNavigate()
  const {
    mutate: login,
    status: loginStatus,
    data: loginResponse,
    error: loginError,
  } = useLogin()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [canShowOpenIdLoading, setCanShowOpenIdLoading] = useState<boolean>(false)

  const submit = (e) => {
    e.preventDefault()
    login({
      password,
      userName: username,
    })
  }

  useEffect(() => {
    if (loginError == undefined) return

    if (loginError.status === 401) return showError('Invalid credentials')

    return showError('Unknown error')
  }, [loginError])

  useEffect(() => {
    // check if response contains everything we need
    if (
      loginStatus !== 'success' ||
      loginResponse?.token == undefined ||
      loginResponse?.refresh_token == undefined
    )
      return

    // save credentials
    localStorage.setItem('username', username)
    localStorage.setItem('token', loginResponse.token)
    localStorage.setItem('refreshToken', loginResponse.refresh_token)

    // go to main page
    navigate('/')
  }, [loginResponse, loginStatus])

  const renderOpenIdLogin = () => {
    return (
      <CRow className="mt-3">
        <CCol className="d-flex">
          <CoreIconButton
            isOutline={false}
            isLoading={canShowOpenIdLoading}
            icon={faFingerprint}
            color={'primary'}
            text={`Login using ${_oidcName}`}
            onClick={() => {
              setCanShowOpenIdLoading(true)
              globalThis.location.href = `${API_URL}/auth/openid/login`
            }}
          />
        </CCol>
      </CRow>
    )
  }

  return (
    <div className="app flex-row align-items-center">
      <CContainer>
        <CRow style={{ margin: '10% 0% 5% 0%' }} className="justify-content-center">
          <img src="/assets/lost_logo.png" alt="lost-logo" style={{ width: '500px' }} />
        </CRow>
        <CRow className="justify-content-center">
          <CCol md="4">
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={submit}>
                    <h1>Login</h1>
                    <p className="text-muted">Sign in to your account</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <FaUser />
                      </CInputGroupText>
                      <CFormInput
                        onChange={(e) => setUsername(e.currentTarget.value)}
                        name="userName"
                        type="text"
                        placeholder="Username"
                        autoComplete="userName"
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <FaLock />
                      </CInputGroupText>
                      <CFormInput
                        onChange={(e) => setPassword(e.currentTarget.value)}
                        name="password"
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                      />
                    </CInputGroup>
                    {loginStatus === 'loading' ? (
                      <CRow className="justify-content-center">
                        <CenteredSpinner />
                      </CRow>
                    ) : (
                      ''
                    )}
                    <CRow>
                      <CCol xs="6">
                        <CButton color="primary" type="submit" className="px-4">
                          Login
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                  {_oidcName && renderOpenIdLogin()}
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
