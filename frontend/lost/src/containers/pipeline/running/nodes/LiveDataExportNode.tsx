import { faCloudDownloadAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Handle, Node, NodeProps, Position } from '@xyflow/react'
import NodeBody from '../../globalComponents/node-structure/NodeBody'
import NodeFooter from '../../globalComponents/node-structure/NodeFooter'
import NodeHeader from '../../globalComponents/node-structure/NodeHeader'

export type LiveDataExportNode = Node<
    {
        state: string
    },
    'liveDataExport'
>

export const LiveDataExportNode = (props: NodeProps<LiveDataExportNode>) => {
    return (
        <>
            <Handle type="target" position={Position.Top} />
            <div className="graph-node">
                <NodeHeader title={'Data Export'} icon={faCloudDownloadAlt} />
                <NodeBody>
                    <span>
                        <FontAwesomeIcon icon={faCloudDownloadAlt} size="3x" />
                    </span>
                </NodeBody>
                <NodeFooter footer={props.data.state}></NodeFooter>
            </div>
            <Handle type="source" position={Position.Bottom} />
        </>
    )
}
