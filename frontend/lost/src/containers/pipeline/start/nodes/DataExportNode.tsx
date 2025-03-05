import { faCloudDownloadAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Handle, Node, NodeProps, Position } from '@xyflow/react'
import NodeBody from '../../globalComponents/node-structure/NodeBody'
import NodeFooter from '../../globalComponents/node-structure/NodeFooter'
import NodeHeader from '../../globalComponents/node-structure/NodeHeader'

export type DataExportNode = Node<
    {
        verified: boolean
    },
    'dataExport'
>

export const DataExportNode = (props: NodeProps<DataExportNode>) => {
    return (
        <>
            <Handle type="target" position={Position.Top} />
            <div className="graph-node">
                <NodeHeader
                    bgColorClass={props.data.verified ? 'bg-green' : 'bg-orange'}
                    title={'Data Export'}
                    icon={faCloudDownloadAlt}
                />
                <NodeBody>
                    <span>
                        <FontAwesomeIcon icon={faCloudDownloadAlt} size="3x" />
                    </span>
                </NodeBody>
                <NodeFooter />
            </div>
            <Handle type="source" position={Position.Bottom} />
        </>
    )
}
