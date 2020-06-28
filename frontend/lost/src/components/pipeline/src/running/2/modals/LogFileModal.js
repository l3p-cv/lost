import React, {useEffect, useState, useRef} from 'react'
import BaseModal from '../../../globalComponents/BaseModal'
import PropTypes from 'prop-types'
import {Input} from 'reactstrap'
import actions from '../../../../../../actions/pipeline/pipelineRunning'
import {useDispatch} from 'react-redux'
import {useWindowSize} from 'react-use'
import {useInterval} from 'react-use'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../../../globalComponents/IconButton'

const TextArea = (props)=>{
    const size = useWindowSize()
    return(
        <Input
            color="secondary"
            readOnly
            innerRef = {props.textArea}
            style= {{
                height: 0.7 * size.height,
                border: `2px solid rgba(255, 0, 0, ${props.isRedBorder ? 1 : 0})`
            }}
            type="textarea"
            defaultValue={props.log}
        />

    )
}


const LogFileModal = (props) => {
    const textArea = useRef(null)
    const dispatch = useDispatch()
    const [log, setLog] = useState('')
    // const [syncCounter, setSyncCounter] = useState(0)
    const [isRedBorder, setIsRedBorder] = useState(false)
    const getLog = async () =>{
        // const logResponse = await dispatch(actions.getLog(props.logPath))
        const logResponse = await actions.getLog(props.logPath)
        setLog(logResponse)
    }
    useEffect(()=>{
        if(props.logPath) {
            getLog()
        }
    }, [props.logPath])


    useInterval(
        () => {
            getLog()
            setIsRedBorder(true)
        },
        2000
    )

    useInterval(()=>{
        if(isRedBorder) {
            setIsRedBorder(false)
        }
    }, 200)


    const downloadLogfile = () => {
        dispatch(actions.downloadLogfile(props.logPath, props.logId))
    }

    const renderFooter = () => {
        return(
            <IconButton
                color="primary"
                onClick={downloadLogfile}
                icon={faDownload}
                text='Download'
            />
        )
    }


    useEffect(()=>{
        if(log && textArea.current) {
            textArea.current.scrollTop = textArea.current.scrollHeight
        }
    }, [log])

    return(
        <BaseModal
            {...props}
            title='Log'
            footer={renderFooter()}
        >
            <TextArea
                textArea={textArea}
                log={log}
                isRedBorder = {isRedBorder}
                // borderOpacity={borderAnimation.borderOpacity}
            />
        </BaseModal>
    )
}

LogFileModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    logPath: PropTypes.string,
    logId: PropTypes.number
}

export default LogFileModal
