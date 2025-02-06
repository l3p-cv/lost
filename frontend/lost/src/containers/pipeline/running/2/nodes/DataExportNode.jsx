import { faCloudDownloadAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import NodeFooter from '../../../globalComponents/node-structure/NodeFooter'

const DataExportNode = (props) => {
    return (
        <div className="graph-node">
            <div className="graph-node-title">
                <span className="graph-node-title-icon">
                    <FontAwesomeIcon icon={faCloudDownloadAlt} />
                </span>
                <span className="graph-node-title-text">{props.title}</span>
            </div>
            <div className="graph-node-body">
                <span>
                    <FontAwesomeIcon icon={faCloudDownloadAlt} size="3x" />
                </span>
            </div>
            <NodeFooter footer={props.footer} />
        </div>
    )
}

export default DataExportNode
