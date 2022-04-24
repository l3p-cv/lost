import React, { useEffect, useState, useRef } from 'react'
import BaseModal from './BaseModal'
import PropTypes from 'prop-types'
import { Input } from 'reactstrap'
import actions from '../actions'
import { useDispatch } from 'react-redux'
import { useWindowSize } from 'react-use'
import { useInterval } from 'react-use'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import IconButton from './IconButton'
import * as Notification from './Notification'
const TextArea = (props) => {
    const size = useWindowSize()
    return (
        <Input
            color="secondary"
            readOnly
            innerRef={props.textArea}
            style={{
                height: 0.7 * size.height,
                border: `2px solid rgba(255, 0, 0, ${props.isRedBorder ? 1 : 0})`,
            }}
            type="textarea"
            defaultValue={props.log}
        />
    )
}

const LogModal = (props) => {
    const textArea = useRef(null)
    const dispatch = useDispatch()
    const [log, setLog] = useState('')
    const [isRedBorder, setIsRedBorder] = useState(false)
    const [firstRequest, setFirstRequest] = useState(true)
    const getLog = async () => {
        let logResponse
        setIsRedBorder(true)
        if (props.pipeId || props.wId) {
            switch (props.actionType) {
                case LogModal.TYPES.PIPELINE:
                    logResponse = await actions.getLog(props.pipeId)
                    break
                case LogModal.TYPES.WORKERS:
                    if (firstRequest) {
                        Notification.showLoading()
                    }
                    logResponse = await actions.getWorkerLogFile(props.wId)
                    break
                default:
                    throw new Error('Unknown type')
            }
        }
        let isAtBottom = false
        if (textArea.current) {
            isAtBottom =
                textArea.current.scrollHeight <=
                textArea.current.scrollTop + textArea.current.clientHeight
        }
        setLog(logResponse)
        if (textArea.current && (isAtBottom || firstRequest)) {
            textArea.current.scrollTop = textArea.current.scrollHeight
        }
        if (firstRequest) {
            Notification.close()
            setFirstRequest(false)
        }
        setTimeout(function () {
            setIsRedBorder(false)
        }, 100)
    }
    useEffect(() => {
        if ((props.pipeId || props.wId) && props.isOpen) {
            getLog()
        }
    }, [props.pipeId, props.wId])

    useInterval(() => {
        if (props.isOpen) {
            getLog()
        }
    }, 2000)

    const downloadLogfile = () => {
        switch (props.actionType) {
            case LogModal.TYPES.PIPELINE:
                dispatch(actions.downloadLogfile(props.pipeId))
                break
            case LogModal.TYPES.WORKERS:
                dispatch(actions.downloadWorkerLogfile(props.wId))
                break
            default:
                throw new Error('Unknown type')
        }
    }

    const renderFooter = () => {
        if (props.isDownloadable) {
            return (
                <IconButton
                    color="primary"
                    onClick={downloadLogfile}
                    icon={faDownload}
                    text="Download"
                />
            )
        }
    }

    return (
        <BaseModal {...props} title="Log" footer={renderFooter()}>
            <TextArea textArea={textArea} log={log} isRedBorder={isRedBorder} />
        </BaseModal>
    )
}

LogModal.TYPES = {
    PIPELINE: 'PIPELINE',
    WORKERS: 'WORKERS',
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

export default LogModal
