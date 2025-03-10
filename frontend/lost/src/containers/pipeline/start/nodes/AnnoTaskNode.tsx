import { faPencilAlt } from '@fortawesome/free-solid-svg-icons'
import { Edge, Handle, Node, NodeProps, Position } from '@xyflow/react'
import {
    AvailableGroup,
    AvailableLabelTree,
    Configuration,
} from '../../../../actions/pipeline/model/pipeline-template-response'
import NodeBody from '../../globalComponents/node-structure/NodeBody'
import NodeFooter from '../../globalComponents/node-structure/NodeFooter'
import NodeHeader from '../../globalComponents/node-structure/NodeHeader'

export type AnnoTaskNodeData = {
    name: string
    type: string
    verified: boolean
    instructions: string
    selectedDataset?: {
        value: string
        label: string
    }
    configuration: Configuration
    selectedLabelTree?: AvailableLabelTree
    labelTreeGraph: {
        nodes: Node[]
        edges: Edge[]
    }
    selectedUserGroup?: AvailableGroup // todo convert later
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
                            value: props.data.name || '',
                        },
                        {
                            key: 'Type',
                            value: props.data.type,
                        },
                        {
                            key: 'Assignee',
                            value:
                                props.data.selectedUserGroup?.name &&
                                props.data.selectedUserGroup?.isUserDefault !== undefined
                                    ? `${props.data.selectedUserGroup.name} (${props.data.selectedUserGroup.isUserDefault ? 'User' : 'Group'})`
                                    : '',
                        },
                    ]}
                />
                <NodeFooter />
            </div>
            <Handle type="source" position={Position.Bottom} />
        </>
    )
}
