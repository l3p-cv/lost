import { CAlert, CSpinner } from '@coreui/react'
import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { exchangeOidcCode } from '../../actions/auth/auth_api'

/**
 * OidcCallbackHandler
 *
 * Wraps the normal app content. On mount it checks whether the URL fragment
 * contains OIDC tokens delivered by the backend callback redirect:
 *
 *   {FRONTEND_URL}/#token=<access_token>&refreshToken=<refresh_token>
 *
 * If tokens are found they are extracted, stored, the fragment is removed from
 * the URL (so tokens don't linger in browser history), and the app navigates
 * to the root so the authenticated layout picks up the new token.
 *
 * If the fragment is absent the children are rendered normally, so the rest of
 * the application is completely unaffected.
 */
const OidcCallbackHandler = ({ children }) => {
  const navigate = useNavigate()
  // const dispatch = useDispatch()
  // null  = not yet checked
  // false = no OIDC fragment, render children normally
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

    // Strip the code from the URL so it doesn't remain in browser history
    globalThis.history.replaceState(null, '', globalThis.location.pathname)

    // Store tokens exactly the same way as the password login flow
    localStorage.setItem('token', token)
    localStorage.setItem('refreshToken', refreshToken)
    axios.defaults.headers.common.Authorization = `Bearer ${token}`

    // Navigate to the root so AppLayout picks up the new token
    navigate('/')

    setOidcHandled(true)
  }

  useEffect(() => {
    const authCode = new URL(globalThis.location.href).searchParams.get('code')

    if (authCode === null) {
      // No OIDC code — render the normal app
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

  // OIDC error (fragment was present but tokens were missing/malformed)
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
  // was no fragment — render children normally.
  return <>{children}</>
}

export default OidcCallbackHandler
