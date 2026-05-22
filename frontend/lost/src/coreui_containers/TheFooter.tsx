import { CFooter } from '@coreui/react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useInterval } from 'react-use'
import { checkExpireDate, getRemainingLoggedInSeconds } from '../api/auth/auth_utils'
import useInactive from '../hooks/useInactive'
import { useLostConfig } from '../hooks/useLostConfig'
import LogoutModal from '../containers/Authentication/LogoutModal'

const TheFooter = () => {
  const navigate = useNavigate()
  const { version, settings } = useLostConfig()
  const { autoLogoutWarnTime } = settings

  const secondsOfInactivity = useInactive()

  const remainingLoggedInSeconds = getRemainingLoggedInSeconds()
  const canShowInactivityWarning = secondsOfInactivity > autoLogoutWarnTime

  useInterval(() => {
    // only try to refresh the token if the user is active (< 30s inactivity)
    if (secondsOfInactivity < 30) checkExpireDate(secondsOfInactivity)

    // inactive for too long - goto logout
    if (remainingLoggedInSeconds <= 0) navigate('/logout#inactivity')
  }, 5000)

  return (
    <CFooter className="mt-2">
      <div>
        <span className="ml-1">
          Powered by{' '}
          <a href="https://github.com/l3p-cv/lost" target="_blank" rel="noreferrer">
            LOST Community
          </a>
        </span>
      </div>
      {canShowInactivityWarning && (
        <LogoutModal remainingSeconds={remainingLoggedInSeconds} />
      )}
      <div className="mfs-auto">
        <span className="ml-auto">
          <span style={{ marginRight: 20 }}></span>
          <b>Version </b>
          <small>{version}</small>
        </span>
      </div>
    </CFooter>
  )
}

export default React.memo(TheFooter)
