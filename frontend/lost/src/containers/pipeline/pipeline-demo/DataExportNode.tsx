import { faCloudDownloadAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Handle, Position } from '@xyflow/react'
import NodeBody from '../globalComponents/node-structure/NodeBody'
import NodeHeader from '../globalComponents/node-structure/NodeHeader'

export const DataExportNode = () => {
    return (
        <>
            <Handle type="target" position={Position.Top} />
            <div className="graph-node">
                <NodeHeader
                    verified={false}
                    title={'Data Export'}
                    icon={faCloudDownloadAlt}
                />
                <NodeBody>
                    <span>
                        <FontAwesomeIcon icon={faCloudDownloadAlt} size="3x" />
                    </span>
                </NodeBody>
                <div className="graph-node-footer"></div>
            </div>
            <Handle type="source" position={Position.Bottom} />
        </>
    )
}
