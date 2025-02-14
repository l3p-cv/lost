import { faChartBar } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import NodeBody from '../../../globalComponents/node-structure/NodeBody'
import NodeHeader from '../../../globalComponents/node-structure/NodeHeader'
const VisualOutputNode = (props) => {
    return (
        <div className="graph-node">
            <NodeHeader
                bgColorClass={props.verified ? 'bg-green' : 'bg-orange'}
                title={props.title}
                icon={faChartBar}
            />
            <NodeBody>
                <span>
                    <FontAwesomeIcon icon={faChartBar} size="3x" />
                </span>
            </NodeBody>
            <div className="graph-node-footer"></div>
        </div>
    )
}

export default VisualOutputNode
