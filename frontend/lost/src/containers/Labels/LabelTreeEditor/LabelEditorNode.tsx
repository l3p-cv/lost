import { Handle, Node, NodeProps, Position } from '@xyflow/react'

export type LabelEditorNodeData = {
    name: string
    color: string
    textColor: string
    description: string
    abbreviation: string
    externalId: string
}

export type LabelEditorNode = Node<LabelEditorNodeData, 'label'>

export const LabelEditorNode = (props: NodeProps<LabelEditorNode>) => {
    return (
        <>
            <Handle type="target" position={Position.Top} />
            <div
                style={{
                    cursor: 'pointer',
                    padding: '6px',
                    border: '1px solid gray',
                    backgroundColor: props.data.color,
                    color: props.data.textColor,
                }}
            >
                {props.data.name}
            </div>
            <Handle type="source" position={Position.Bottom} />
        </>
    )
}
