import { faPencilAlt } from '@fortawesome/free-solid-svg-icons'
import { Handle, Node, NodeProps, Position } from '@xyflow/react'
import NodeBody from '../../globalComponents/node-structure/NodeBody'
import NodeFooter from '../../globalComponents/node-structure/NodeFooter'
import NodeHeader from '../../globalComponents/node-structure/NodeHeader'

export type AnnoTaskNode = Node<
    {
        name: string
        type: string
        assignee: string
        verified: boolean
    },
    'annoTask'
>

export const AnnoTaskNode = (props: NodeProps<AnnoTaskNode>) => {
    return (
        <>
            <Handle type="target" position={Position.Top} />
            <div className="graph-node">
                <NodeHeader
                    bgColorClass={props.data.verified ? 'bg-green' : 'bg-orange'}
                    title={'Annotation Task'}
                    icon={faPencilAlt}
                />
                <NodeBody
                    data={[
                        {
                            key: 'Name',
                            value: props.data.name,
                        },
                        {
                            key: 'Type',
                            value: props.data.type,
                        },
                        {
                            key: 'Assignee',
                            value: props.data.assignee,
                        },
                    ]}
                />
                <NodeFooter />
            </div>
            <Handle type="source" position={Position.Bottom} />
        </>
    )
}
