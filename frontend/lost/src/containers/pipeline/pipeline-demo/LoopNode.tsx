import { faSync } from '@fortawesome/free-solid-svg-icons'
import { Handle, Position } from '@xyflow/react'
import NodeBody from '../globalComponents/node-structure/NodeBody'
import NodeHeader from '../globalComponents/node-structure/NodeHeader'

export const LoopNode = () => {
    return (
        <>
            <Handle type="target" position={Position.Top} />
            <div className="graph-node">
                <NodeHeader verified={false} title={'Loop'} icon={faSync} />
                <NodeBody
                    data={[
                        {
                            key: 'Max Iterations',
                            value: 20,
                        },
                    ]}
                />
                <div className="graph-node-footer"></div>
            </div>
            <Handle type="source" position={Position.Left} />
            <Handle type="source" position={Position.Right} />
        </>
    )
}
