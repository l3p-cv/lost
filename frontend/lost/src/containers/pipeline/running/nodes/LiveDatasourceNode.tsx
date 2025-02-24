import { faFolderOpen, faHdd } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Handle, Node, NodeProps, Position } from '@xyflow/react'
import NodeBody from '../../globalComponents/node-structure/NodeBody'
import NodeFooter from '../../globalComponents/node-structure/NodeFooter'
import NodeHeader from '../../globalComponents/node-structure/NodeHeader'

export type LiveDatasourceNode = Node<
    {
        state: string
    },
    'liveDatasource'
>

export const LiveDatasourceNode = (props: NodeProps<LiveDatasourceNode>) => {
    return (
        <>
            <Handle type="target" position={Position.Top} />
            <div className="graph-node">
                <NodeHeader title={'Datasource'} icon={faHdd} />
                <NodeBody>
                    <span>
                        <FontAwesomeIcon icon={faFolderOpen} size="3x" />
                    </span>
                </NodeBody>
                <NodeFooter footer={props.data.state}></NodeFooter>
            </div>
            <Handle type="source" position={Position.Bottom} />
        </>
    )
}
