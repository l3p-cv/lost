import React from 'react'
import { faDatabase } from '@fortawesome/free-solid-svg-icons'
import VerificationTitle from './VerificationTitle'
import NodeBody from './NodeBody'
const VisualOutputNode = (props) => {
    return (
        <div className='graph-node'>
            <VerificationTitle
                verified={props.verified}
                title={props.title}
                icon={faDatabase}
            />
            <NodeBody
            />
            <div className='graph-node-footer'></div>
        </div>

    )
}

export default VisualOutputNode