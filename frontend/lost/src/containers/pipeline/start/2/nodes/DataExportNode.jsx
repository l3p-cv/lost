import { faCloudDownloadAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import NodeBody from '../../../globalComponents/node-structure/NodeBody'
import NodeHeader from '../../../globalComponents/node-structure/NodeHeader'

const DataExportNode = (props) => {
    return (
        <div className="graph-node">
            <NodeHeader
                bgColorClass={props.verified ? 'bg-green' : 'bg-orange'}
                title={props.title}
                icon={faCloudDownloadAlt}
            />
            <NodeBody>
                <span>
                    <FontAwesomeIcon icon={faCloudDownloadAlt} size="3x" />
                </span>
            </NodeBody>
            <div className="graph-node-footer"></div>
        </div>
    )
}

export default DataExportNode
