import { faHdd } from '@fortawesome/free-solid-svg-icons'
import NodeBody from '../../../globalComponents/node-structure/NodeBody'
import NodeHeader from '../../../globalComponents/node-structure/NodeHeader'
const DatasourceNode = (props) => {
    return (
        <div className="graph-node">
            <NodeHeader
                bgColorClass={props.verified ? 'bg-green' : 'bg-orange'}
                title={props.title}
                icon={faHdd}
            />
            <NodeBody
                data={[
                    {
                        key: 'Type',
                        value: props.type,
                    },
                    {
                        key: 'Source',
                        value: props.exportData.datasource.selectedPath,
                    },
                ]}
            />
            <div className="graph-node-footer"></div>
        </div>
    )
}

export default DatasourceNode
