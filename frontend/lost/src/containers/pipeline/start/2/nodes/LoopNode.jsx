import { faSync } from '@fortawesome/free-solid-svg-icons'
import NodeBody from '../../../globalComponents/node-structure/NodeBody'
import NodeHeader from '../../../globalComponents/node-structure/NodeHeader'
const LoopNode = (props) => {
    return (
        <div className="graph-node">
            <NodeHeader
                bgColorClass={props.verified ? 'bg-green' : 'bg-orange'}
                title={props.title}
                icon={faSync}
            />
            <NodeBody
                data={[
                    {
                        key: 'Max Iterations',
                        value:
                            typeof props.exportData.loop.maxIteration === 'number' &&
                            props.exportData.loop.maxIteration > -1
                                ? props.exportData.loop.maxIteration
                                : 'Infinity',
                    },
                ]}
            />
            <div className="graph-node-footer"></div>
        </div>
    )
}

export default LoopNode
