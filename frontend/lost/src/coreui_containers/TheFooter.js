import React, { useEffect } from 'react'
import { CFooter } from '@coreui/react'
import { useInterval } from 'react-use'
import { useSelector, useDispatch } from 'react-redux'
import SweetAlert from 'react-bootstrap-sweetalert'
import { useHistory } from 'react-router-dom'
import useInactive from '../hooks/useInactive'
import * as styles from '../components/styles'
import actions from '../actions'

const TheFooter = () => {
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(actions.loadSettings())
    }, [])

    const history = useHistory()
    const version = useSelector((state) => state.lost.version)
    const autoLogoutWarnTime = useSelector(
        (state) => state.lost.settings.autoLogoutWarnTime,
    )
    const autoLogoutTime = useSelector((state) => state.lost.settings.autoLogoutTime)
    const isDevMode = useSelector((state) => state.lost.settings.isDevMode)
    const timer = useInactive(autoLogoutTime, true)
    let seconds = timer % 60
    seconds = seconds > 9 ? seconds : `0${seconds}`
    const minutes = parseInt(timer / 60)

    useInterval(() => {
        dispatch(
            actions.checkExpireDate(
                new Date(Date.now() - (autoLogoutTime - timer) * 1000).getTime(),
            ),
        )
    }, 2000)

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
                    Powered by{' '}
                    <a href="https://github.com/l3p-cv/lost" target="_blank">
                        LOST Community
                    </a>
                </span>
            </div>
            {/* {renderAutologoutTimerFooter()} */}
            {renderAutologoutModal()}
            <div className="mfs-auto">
                <span className="ml-auto">
                    <span style={{ marginRight: 20 }}>
                        {/* {isDevMode ? 'React Development Mode' : ''} */}
                    </span>
                    <b>Version </b>
                    <small>{version}</small>
                </span>
            </div>
        </CFooter>
    )
}

export default React.memo(TheFooter)
