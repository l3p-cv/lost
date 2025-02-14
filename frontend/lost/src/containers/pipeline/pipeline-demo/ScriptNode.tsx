import { faRocket } from '@fortawesome/free-solid-svg-icons'
import { Handle, Position } from '@xyflow/react'
import NodeBody from '../globalComponents/node-structure/NodeBody'
import NodeHeader from '../globalComponents/node-structure/NodeHeader'

export const ScriptNode = () => {
    return (
        <>
            <Handle type="target" position={Position.Top} />
            <div className="graph-node">
                <NodeHeader verified={false} title={'Script'} icon={faRocket} />
                <NodeBody
                    data={[
                        {
                            key: 'Name',
                            value: 'name',
                        },
                    ]}
                >
                    <div className="graph-node-body-row">
                        <span className="arguments-lable graph-node-body-left-text">
                            Arguments available
                        </span>
                    </div>
                </NodeBody>
                <div className="graph-node-footer"></div>
            </div>
            <Handle type="source" position={Position.Bottom} />
        </>
    )
}
