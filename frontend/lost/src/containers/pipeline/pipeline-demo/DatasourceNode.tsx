import { faHdd } from '@fortawesome/free-solid-svg-icons'
import { Handle, Node, NodeProps, Position } from '@xyflow/react'
import NodeBody from '../globalComponents/node-structure/NodeBody'
import NodeHeader from '../globalComponents/node-structure/NodeHeader'

export type DatasourceNode = Node<
    {
        handlePosition: Position
    },
    'annoTask'
>

export const DatasourceNode = ({ data }: NodeProps<DatasourceNode>) => {
    return (
        <>
            <Handle type="target" position={data.handlePosition || Position.Top} />
            <div className="graph-node">
                <NodeHeader verified={false} title={'Datasource'} icon={faHdd} />
                <NodeBody
                    data={[
                        {
                            key: 'Type',
                            value: 'test',
                        },
                        {
                            key: 'Source',
                            value: 'test',
                        },
                    ]}
                />
                <div className="graph-node-footer"></div>
            </div>
            <Handle type="source" position={Position.Bottom} />
        </>
    )
}
