import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { Input } from 'reactstrap'
import { useDispatch } from 'react-redux'
import { useWindowSize, useInterval } from 'react-use'

import { faDownload } from '@fortawesome/free-solid-svg-icons'
import actions from '../actions/index'
import BaseModal from './BaseModal'
import IconButton from './IconButton'

export const TextArea = ({ textArea, isRedBorder, log }) => {
    const size = useWindowSize()
    return (
        <Input
            color="secondary"
            readOnly
            innerRef={textArea}
            style={{
                height: 0.7 * size.height,
                border: `2px solid rgba(255, 0, 0, ${isRedBorder ? 1 : 0})`,
            }}
            type="textarea"
            value={log}
        />
    )
}

const LogModal = ({
    logPath,
    actionType,
    message,
    wiLogId,
    daemonIdx,
    workflowId,
    isDownloadable,
    isOpen,
    toggle,
}) => {
    const textArea = useRef(null)
    const dispatch = useDispatch()
    const [log, setLog] = useState('')
    const [isRedBorder, setIsRedBorder] = useState(false)
    const getLog = async () => {
        let logResponse
        setIsRedBorder(true)
        if (logPath || message) {
            switch (actionType) {
                case LogModal.TYPES.WORKFLOW_INSTANCE:
                    logResponse = await actions.getWorflowInstanceLog(wiLogId)
                    break
                case LogModal.TYPES.WORKERS:
                    logResponse = await actions.getWorkerLog(logPath)
                    break
                case LogModal.TYPES.DAEMONS:
                    logResponse = await actions.getDaemonLog(daemonIdx)
                    break
                case LogModal.TYPES.WORKFLOW_ARM:
                    logResponse = await actions.getWorkflowArmLog(workflowId)
                    break
                default:
                    throw new Error('Unknown type')
            }
        }
        setLog(logResponse)
        setTimeout(() => {
            setIsRedBorder(false)
        }, 100)
    }
    useEffect(() => {
        if (logPath || message) {
            getLog()
        }
    }, [logPath])

    useInterval(() => {
        getLog()
    }, 2000)

    const downloadLogfile = () => {
        switch (actionType) {
            case LogModal.TYPES.WORKFLOW_INSTANCE:
                dispatch(actions.downloadWorkflowInstanceLog(logPath, wiLogId))
                break
            case LogModal.TYPES.WORKERS:
                break
            case LogModal.TYPES.DAEMONS:
                break
            default:
                throw new Error('Unknown type')
        }
    }

    const renderFooter = () => {
        if (isDownloadable) {
            return (
                <IconButton
                    color="primary"
                    onClick={downloadLogfile}
                    icon={faDownload}
                    text="Download"
                />
            )
        }
        return null
    }

    useEffect(() => {
        if (log && textArea.current) {
            textArea.current.scrollTop = textArea.current.scrollHeight
        }
    }, [log])

    return (
        <BaseModal isOpen={isOpen} toggle={toggle} title="Log" footer={renderFooter()}>
            <TextArea
                textArea={textArea}
                log={log}
                isRedBorder={isRedBorder}
                // borderOpacity={borderAnimation.borderOpacity}
            />
        </BaseModal>
    )
}

LogModal.TYPES = {
    WORKFLOW_INSTANCE: 'WI',
    WORKERS: 'WORKERS',
    DAEMONS: 'DAEMONS',
    WORKFLOW_ARM: 'WORKFLOW_ARM',
}

LogModal.propTypes = {
    isDownloadable: PropTypes.bool,
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    message: PropTypes.string,
    logPath: PropTypes.string,
    wiLogId: PropTypes.number,
    actionType: PropTypes.string.isRequired,
}
LogModal.defaultProps = {
    isDownloadable: false,
    message: '',
    logPath: '',
    wiLogId: 0,
}

export default LogModal
