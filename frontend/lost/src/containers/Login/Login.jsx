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
} from '@coreui/react'
import { useState } from 'react'
import { FaLock, FaUser } from 'react-icons/fa'
import { useLogin } from '../../actions/auth'
import Loading from '../../components/Loading'

const Login = () => {
  const { mutate: login, status: loginStatus } = useLogin()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const submit = (e) => {
    e.preventDefault()
    login({
      password,
      userName: username,
    })
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
                        <Loading size="3x"></Loading>
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
