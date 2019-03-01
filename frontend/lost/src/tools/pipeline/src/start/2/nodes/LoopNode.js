import React from 'react'
import { faDatabase } from '@fortawesome/free-solid-svg-icons'
import VerificationTitle from './VerificationTitle'
import NodeBody from './NodeBody'
const DatasourceNode = (props) => {
    return (
        <div className='graph-node'>
            <VerificationTitle
                verified={props.verified}
                title={props.title}
                icon={faDatabase}
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

export default DatasourceNode