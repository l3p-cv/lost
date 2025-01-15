import React from 'react'
import { faHdd } from '@fortawesome/free-solid-svg-icons'
import VerificationTitle from './VerificationTitle'
import NodeBody from './NodeBody'
const DatasourceNode = (props) => {
    return (
        <div className="graph-node">
            <VerificationTitle
                verified={props.verified}
                title={props.title}
                icon={faHdd}
            />
            <NodeBody
                data={[
                    {
                        key: 'Type',
                        value: props.type,
                    },
                    {
                        key: 'Source',
                        value: props.exportData.datasource.selectedPath,
                    },
                ]}
            />
            <div className="graph-node-footer"></div>
        </div>
    )
}

export default DatasourceNode
