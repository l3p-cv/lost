import React from 'react'
import { CFooter } from '@coreui/react'
import { useSelector } from 'react-redux'
import SweetAlert from 'react-bootstrap-sweetalert'
import { useHistory } from 'react-router-dom'
import useInactive from '../hooks/useInactive'
import * as styles from '../components/styles'

const TheFooter = () => {
    const history = useHistory()
    const version = useSelector((state) => state.lost.version)
    const autoLogoutWarnTime = useSelector((state) => state.lost.settings.autoLogoutWarnTime)
    const autoLogoutTime = useSelector((state) => state.lost.settings.autoLogoutTime)
    const isDevMode = useSelector((state) => state.lost.settings.isDevMode)
    const timer = useInactive(autoLogoutTime, true)
    let seconds = timer % 60
    seconds = seconds > 9 ? seconds : `0${seconds}`
    const minutes = parseInt(timer / 60)
    const renderAutologoutTimerFooter = () => {
        if (isDevMode) {
            return (
                <div className="ml-auto">
                    <p style={{ margin: 0 }}>
                        {' '}
                        Auto logout in{' '}
                        <span>
                            {minutes}:{seconds}
                        </span>
                    </p>
                    <p style={{ margin: 0, ...styles.centered }}>
                        Warntime: {parseInt(autoLogoutWarnTime / 60)}:
                        {autoLogoutWarnTime % 60 < 10
                            ? `0${autoLogoutWarnTime % 60}`
                            : autoLogoutWarnTime % 60}
                    </p>
                </div>
            )
        }
        return null
    }

    const renderAutologoutModal = () => {
        if (timer === 0) {
            history.push('/logout#timeout')
        } else if (timer < autoLogoutWarnTime) {
            return (
                <SweetAlert
                    // TODO: close Animation does not work
                    // closeAnim={{ name: 'hideSweetAlert', duration: 1000 }}
                    showConfirm={false}
                    warning
                    title="Autologout in "
                >
                    {minutes}:{seconds}
                </SweetAlert>
            )
        }
        return null
    }

    return (
        <CFooter fixed={false}>
            <div>
                <span className="ml-1">
                    Powered by <a href="https://lost.com">LOST</a>
                </span>
            </div>
            {renderAutologoutTimerFooter()}
            {renderAutologoutModal()}
            <div className="mfs-auto">
                <span className="ml-auto">
                    <span style={{ marginRight: 20 }}>
                        {isDevMode ? 'React Development Mode' : ''}
                    </span>
                    <b>Version </b>
                    <small>LOST@{version}</small>
                </span>
            </div>
        </CFooter>
    )
}

export default React.memo(TheFooter)
