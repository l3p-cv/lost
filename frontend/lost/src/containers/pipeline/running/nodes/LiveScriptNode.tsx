import { faRocket } from '@fortawesome/free-solid-svg-icons'
import { Handle, Node, NodeProps, Position } from '@xyflow/react'
import NodeBody from '../../globalComponents/node-structure/NodeBody'
import NodeFooter from '../../globalComponents/node-structure/NodeFooter'
import NodeHeader from '../../globalComponents/node-structure/NodeHeader'
import { CProgress } from '@coreui/react'

export type LiveScriptNode = Node<
    {
        name: string
        progress: number
        state: string
    },
    'liveScript'
>

export const LiveScriptNode = (props: NodeProps<LiveScriptNode>) => {
    return (
        <>
            <Handle type="target" position={Position.Top} />
            <div className="graph-node">
                <NodeHeader title={'Script'} icon={faRocket} />
                <NodeBody
                    data={[
                        {
                            key: 'Name',
                            value: props.data.name,
                        },
                    ]}
                >
                    <CProgress value={props.data.progress}>
                        {props.data.progress}%
                    </CProgress>
                </NodeBody>
                <NodeFooter footer={props.data.state}></NodeFooter>
            </div>
            <Handle type="source" position={Position.Bottom} />
        </>
    )
}
