import { Handle, Node, NodeProps, Position } from '@xyflow/react'

export type LabelEditorNodeData = {
    name: string
    color: string
    textColor: string
    description: string
    abbreviation: string
    externalId: string
    is_root?: boolean
}

export type LabelEditorNode = Node<LabelEditorNodeData, 'label'>

export const LabelEditorNode = (props: NodeProps<LabelEditorNode>) => {
    const isRoot = props.data.is_root
    return (
        <>
            <Handle type="target" position={Position.Top} />
            <div
                className={`label-node ${isRoot ? 'root-node' : ''}`}
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
