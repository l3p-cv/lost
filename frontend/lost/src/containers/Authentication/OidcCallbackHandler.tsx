import { CAlert, CSpinner } from '@coreui/react'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { exchangeOidcCode } from '../../actions/auth/auth_api'

/**
 * OidcCallbackHandler
 *
 * Wraps the normal app content. On mount it checks whether the URL query string
 * contains an OIDC authorization code delivered by the backend callback redirect:
 *
 *   {FRONTEND_URL}/?code=<temp_code>
 *
 * If a code is found it is exchanged for access/refresh tokens via the backend
 * token-exchange endpoint. On success the tokens are stored, the code is removed
 * from the URL (so it doesn't linger in browser history), and the app navigates
 * to the root so the authenticated layout picks up the new token.
 *
 * If no code query parameter is present the children are rendered normally, so
 * the rest of the application is completely unaffected.
 */
const OidcCallbackHandler = ({ children }) => {
  const navigate = useNavigate()
  // const dispatch = useDispatch()
  // null  = not yet checked
  // false = no OIDC code query param, render children normally
  // true  = processing / done
  const [oidcHandled, setOidcHandled] = useState<boolean | null>(null)
  const [errorText, setErrorText] = useState<string | null>(null)
  const requestInFlight = useRef<boolean>(false)

  const handleOidcCode = async (authCode) => {
    let token, refreshToken
    try {
      const data = await exchangeOidcCode(authCode)
      token = data.token
      refreshToken = data.refreshToken
    } catch (e) {
      console.log(e)
      setErrorText('SSO login failed: could not exchange authorization code for tokens.')
      setOidcHandled(true)
      return
    }

    if (!token || !refreshToken) {
      setErrorText('SSO login failed: incomplete token data received.')
      setOidcHandled(true)
      return
    }

    const decodedToken = jwtDecode(token)
    const username = decodedToken.username

    // Strip the code from the URL so it doesn't remain in browser history
    globalThis.history.replaceState(null, '', globalThis.location.pathname)

    // Store tokens exactly the same way as the password login flow
    localStorage.setItem('username', username)
    localStorage.setItem('token', token)
    localStorage.setItem('refreshToken', refreshToken)
    axios.defaults.headers.common.Authorization = `Bearer ${token}`

    // Navigate to the root so AppLayout picks up the new token
    navigate('/')

    setOidcHandled(true)
  }

  useEffect(() => {
    const isCallbackPath = globalThis.location.pathname === '/auth/callback'
    const authCode = new URL(globalThis.location.href).searchParams.get('code')

    if (!isCallbackPath || authCode === null) {
      // No OIDC authorization code — render the normal app
      setOidcHandled(false)
      return
    }

    // prevent multiple calls (e.g. React StrictMode double-invoke)
    if (requestInFlight.current) return
    requestInFlight.current = true
    handleOidcCode(authCode)
  }, [])

  // Still checking - show spinner
  if (oidcHandled === null) {
    return (
      <div className="pt-3 text-center">
        <CSpinner color="primary" variant="grow" />
      </div>
    )
  }

  // OIDC error (code was present but token exchange failed or returned incomplete data)
  if (oidcHandled === true && errorText) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <CAlert color="danger" style={{ maxWidth: 480 }}>
          {errorText}
        </CAlert>
      </div>
    )
  }

  // Either OIDC was handled successfully (navigate already called) or there
  // was no code param — render children normally.
  return <>{children}</>
}

export default OidcCallbackHandler
