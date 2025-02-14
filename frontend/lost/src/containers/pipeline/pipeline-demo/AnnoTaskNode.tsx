import { faPencilAlt } from '@fortawesome/free-solid-svg-icons'
import { Handle, Position } from '@xyflow/react'
import NodeBody from '../globalComponents/node-structure/NodeBody'
import NodeHeader from '../globalComponents/node-structure/NodeHeader'

export const AnnoTaskNode = () => {
    return (
        <>
            <Handle type="target" position={Position.Top} />
            <div className="graph-node">
                <NodeHeader verified={false} title={'Anno Task'} icon={faPencilAlt} />
                <NodeBody
                    data={[
                        {
                            key: 'Name',
                            value: '"pipes/lost_semi_auto_pipes/triton_semi/export_label_dict.py"',
                        },
                        {
                            key: 'Type',
                            value: 'type',
                        },
                        {
                            key: 'Assignee',
                            value: 'assignee',
                        },
                    ]}
                />
                <div className="graph-node-footer"></div>
            </div>
            <Handle type="source" position={Position.Bottom} />
        </>
    )
}
