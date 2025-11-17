import { Handle, Node, NodeProps, Position } from '@xyflow/react'

export type LabelNode = Node<
  {
    label: string
    selectedAsParent: boolean // selected as parent (required to be sent to the backend)
    selected: boolean // selected in the annotation task
    color: string
    backgroundColor: string
  },
  'label'
>

export const LabelNode = (props: NodeProps<LabelNode>) => {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div
        style={{
          cursor: 'pointer',
          color: 'black',
          backgroundColor: props.data.selected ? '#a7e0ed' : 'white',
          padding: '6px',
          border: '1px solid gray',
        }}
      >
        {props.data.label}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  )
}
