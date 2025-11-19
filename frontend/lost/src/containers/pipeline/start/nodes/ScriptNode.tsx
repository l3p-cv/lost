import { faRocket } from '@fortawesome/free-solid-svg-icons'
import { Handle, Node, NodeProps, Position } from '@xyflow/react'
import NodeBody from '../../globalComponents/node-structure/NodeBody'
import NodeHeader from '../../globalComponents/node-structure/NodeHeader'

export type ScriptNodeData = {
  arguments: object | null
  name: string
  verified: boolean
}

export type ScriptNode = Node<ScriptNodeData, 'script'>

export const ScriptNode = (props: NodeProps<ScriptNode>) => {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className="graph-node">
        <NodeHeader
          bgColorClass={props.data.verified ? 'bg-green' : 'bg-orange'}
          title={'Script'}
          icon={faRocket}
        />
        <NodeBody
          data={[
            {
              key: 'Name',
              value: props.data.name,
            },
          ]}
        >
          {props.data.arguments ? (
            <div className="graph-node-body-row">
              <span className="arguments-lable graph-node-body-left-text">
                Arguments available
              </span>
            </div>
          ) : null}
        </NodeBody>
        <div className="graph-node-footer"></div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  )
}
