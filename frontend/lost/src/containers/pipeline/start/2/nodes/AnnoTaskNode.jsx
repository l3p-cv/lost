import { faPencilAlt } from '@fortawesome/free-solid-svg-icons'
import NodeBody from '../../../globalComponents/node-structure/NodeBody'
import NodeHeader from '../../../globalComponents/node-structure/NodeHeader'
const AnnoTaskNode = (props) => {
    return (
        <div className="graph-node">
            <NodeHeader
                bgColorClass={props.verified ? 'bg-green' : 'bg-orange'}
                title={props.title}
                icon={faPencilAlt}
            />
            <NodeBody
                data={[
                    {
                        key: 'Name',
                        value: props.exportData.annoTask.name,
                    },
                    {
                        key: 'Type',
                        value: props.exportData.annoTask.type,
                    },
                    {
                        key: 'Assignee',
                        value: props.exportData.annoTask.assignee,
                    },
                ]}
            />
            <div className="graph-node-footer"></div>
        </div>
    )
}

export default AnnoTaskNode
