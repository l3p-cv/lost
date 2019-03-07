import React from 'react'
import { faCloudDownloadAlt } from '@fortawesome/free-solid-svg-icons'
import VerificationTitle from './VerificationTitle'
import NodeBody from './NodeBody'

const DataExportNode = (props) => {
    return (
        <div className='graph-node'>

            <VerificationTitle
                verified={props.verified}
                title={props.title}
                icon={faCloudDownloadAlt}
            />
            <NodeBody
            />
            <div className='graph-node-footer'></div>

        </div>
    )
}

export default DataExportNode
