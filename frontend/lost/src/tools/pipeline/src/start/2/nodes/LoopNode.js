import React from 'react'
import { faSync } from '@fortawesome/free-solid-svg-icons'
import VerificationTitle from './VerificationTitle'
import NodeBody from './NodeBody'
const LoopNode = (props) => {
    return (
        <div className='graph-node'>
            <VerificationTitle
                verified={props.verified}
                title={props.title}
                icon={faSync}
            />
            <NodeBody
                data={[
                    {
                        key: 'Max Iterations',
                        value: props.exportData.loop.maxIteration?props.exportData.loop.maxIteration: '0'
                    }
                ]}
            />
            <div className='graph-node-footer'></div>
        </div>

    )
}

export default LoopNode