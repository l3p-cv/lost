import { faPencilAlt } from '@fortawesome/free-solid-svg-icons'
import { Handle, Node, NodeProps, Position } from '@xyflow/react'
import { Progress } from 'reactstrap'
import NodeBody from '../../globalComponents/node-structure/NodeBody'
import NodeFooter from '../../globalComponents/node-structure/NodeFooter'
import NodeHeader from '../../globalComponents/node-structure/NodeHeader'

export type LiveAnnoTaskNode = Node<
    {
        name: string
        progress: number
        state: string
    },
    'liveAnnoTask'
>

export const LiveAnnoTaskNode = (props: NodeProps<LiveAnnoTaskNode>) => {
    return (
        <>
            <Handle type="target" position={Position.Top} />
            <div className="graph-node">
                <NodeHeader title={'Anno Task'} icon={faPencilAlt} />
                <NodeBody
                    data={[
                        {
                            key: 'Name',
                            value: props.data.name,
                        },
                    ]}
                >
                    <Progress value={props.data.progress}>{props.data.progress}</Progress>
                </NodeBody>
                <NodeFooter footer={props.data.state}></NodeFooter>
            </div>
            <Handle type="source" position={Position.Bottom} />
        </>
    )
}
