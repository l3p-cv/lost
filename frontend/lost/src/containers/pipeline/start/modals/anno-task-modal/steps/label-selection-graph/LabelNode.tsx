import { Handle, Node, NodeProps, Position } from '@xyflow/react'

export type LabelNode = Node<
    {
        label: string
        highlighted: boolean
    },
    'label'
>

export const LabelNode = (props: NodeProps<LabelNode>) => {
    return (
        <>
            <Handle type="target" position={Position.Top} />
            <div
                style={{
                    border: props.data.highlighted ? '2px solid red' : '1px solid grey',
                    padding: '6px',
                }}
            >
                {props.data.label}
            </div>
            <Handle type="source" position={Position.Bottom} />
        </>
    )
}
