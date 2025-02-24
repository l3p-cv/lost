import { faSync } from '@fortawesome/free-solid-svg-icons'
import { Handle, Node, NodeProps, Position } from '@xyflow/react'
import NodeBody from '../../globalComponents/node-structure/NodeBody'
import NodeFooter from '../../globalComponents/node-structure/NodeFooter'
import NodeHeader from '../../globalComponents/node-structure/NodeHeader'

export type LiveLoopNode = Node<
    {
        maxIteration: number | string
        state: string
    },
    'liveLoop'
>

export const LiveLoopNode = (props: NodeProps<LiveLoopNode>) => {
    return (
        <>
            <Handle type="target" position={Position.Top} />
            <div className="graph-node">
                <NodeHeader title={'Loop'} icon={faSync} />
                <NodeBody
                    data={[
                        {
                            key: 'Max Iterations',
                            value:
                                typeof props.data.maxIteration === 'number' &&
                                props.data.maxIteration > -1
                                    ? props.data.maxIteration.toString()
                                    : 'Infinity',
                        },
                    ]}
                />
                <NodeFooter footer={props.data.state}></NodeFooter>
            </div>
            <Handle type="source" position={Position.Left} />
            <Handle type="source" position={Position.Right} />
        </>
    )
}
