import { faHdd } from '@fortawesome/free-solid-svg-icons'
import { Handle, Node, NodeProps, Position } from '@xyflow/react'
import NodeBody from '../../globalComponents/node-structure/NodeBody'
import NodeFooter from '../../globalComponents/node-structure/NodeFooter'
import NodeHeader from '../../globalComponents/node-structure/NodeHeader'

export type DatasourceNodeData = {
  type: string
  selectedPath: string
  verified: boolean
  fsId: number
}

export type DatasourceNode = Node<DatasourceNodeData, 'datasource'>

export const DatasourceNode = (props: NodeProps<DatasourceNode>) => {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className="graph-node">
        <NodeHeader
          bgColorClass={props.data.verified ? 'bg-green' : 'bg-orange'}
          title={'Datasource'}
          icon={faHdd}
        />
        <NodeBody
          data={[
            {
              key: 'Type',
              value: props.data.type,
            },
            {
              key: 'Source',
              value: props.data.selectedPath,
            },
          ]}
        />
        <NodeFooter />
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  )
}
