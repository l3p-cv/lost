import { faPencilAlt } from '@fortawesome/free-solid-svg-icons'
import { Handle, Node, NodeProps, Position } from '@xyflow/react'
import { Configuration } from '../../../../actions/pipeline/model/pipeline-template-response'
import NodeBody from '../../globalComponents/node-structure/NodeBody'
import NodeFooter from '../../globalComponents/node-structure/NodeFooter'
import NodeHeader from '../../globalComponents/node-structure/NodeHeader'

interface LabelLeaf {
    id: number
    maxLabels: string
}

export type AnnoTaskNodeData = {
    name: string
    type: string
    assignee: string
    workerId: number // note: not available initially, populated later when configuring the annotation task
    verified: boolean
    instructions: string
    selectedDatasetId: string
    configuration: Configuration
    labelTreeId: number
    labelLeaves: LabelLeaf[]
}

export type AnnoTaskNode = Node<AnnoTaskNodeData, 'annoTask'>

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
