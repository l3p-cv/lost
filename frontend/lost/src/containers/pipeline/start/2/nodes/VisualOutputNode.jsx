import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartBar } from '@fortawesome/free-solid-svg-icons'
import VerificationTitle from './VerificationTitle'
import NodeBody from './NodeBody'
const VisualOutputNode = (props) => {
    return (
        <div className='graph-node'>
            <VerificationTitle
                verified={props.verified}
                title={props.title}
                icon={faChartBar}
            />
            <NodeBody
            >
                <span><FontAwesomeIcon icon={faChartBar} size='3x' /></span>

            </NodeBody>
            <div className='graph-node-footer'></div>
        </div>

    )
}

export default VisualOutputNode