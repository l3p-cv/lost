import { CAlert, CSpinner } from '@coreui/react'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

  useEffect(() => {
    const hash = window.location.hash
    if (!hash || !hash.includes('token=')) {
      // No OIDC fragment — render the normal app
      setOidcHandled(false)
      return
    }

    // Parse the fragment as query-string parameters
    // hash looks like: "#token=xxx&refreshToken=yyy"
    const params = new URLSearchParams(hash.slice(1)) // strip leading '#'
    const token = params.get('token')
    const refreshToken = params.get('refreshToken')

    if (!token || !refreshToken) {
      setErrorText('SSO login failed: incomplete token data received.')
      setOidcHandled(true)
      return
    }

    // Strip the fragment from the URL so tokens don't remain in browser history
    window.history.replaceState(
      null,
      '',
      window.location.pathname + window.location.search,
    )

    // save credentials
    localStorage.setItem('token', token)
    localStorage.setItem('refreshToken', refreshToken)
    axios.defaults.headers.common.Authorization = `Bearer ${token}`

    // Navigate to the root so AppLayout picks up the new token
    navigate('/')

    setOidcHandled(true)
  }, [])

  // Still checking
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
