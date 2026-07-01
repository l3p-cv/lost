import { Handle, Node, NodeProps, Position } from '@xyflow/react'

export type LabelEditorNodeData = {
  name: string
  color: string
  textColor: string
  description: string
  abbreviation: string
  externalId: string
  is_root?: boolean
  isDirty?: boolean
}

export type LabelEditorNode = Node<LabelEditorNodeData, 'label'>

export const LabelEditorNode = (props: NodeProps<LabelEditorNode>) => {
  const isRoot = props.data.is_root
  const isDirty = props.data.isDirty
  return (
    <div style={{ position: 'relative' }}>
      <Handle type="target" position={Position.Top} />
      {isDirty && (
        <span
          title="Unsaved changes"
          style={{
            position: 'absolute',
            top: '-6px',
            right: '-6px',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: 'orange',
            zIndex: 10,
            pointerEvents: 'auto',
          }}
        />
      )}
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
    </div>
  )
}
