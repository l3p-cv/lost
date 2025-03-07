import {
    Background,
    BackgroundVariant,
    Controls,
    Edge,
    Node,
    ReactFlow,
    useEdgesState,
    useNodesState,
    useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useEffect } from 'react'
import { LayoutOptions, useAutoLayout } from '../../../../../useAutoLayout'
import '../../../../../xy-theme.css'
import { LabelNode } from './LabelNode'

const labelTreeNodeTypes = {
    labelNode: LabelNode,
}

const defaultLayoutOptions: LayoutOptions = {
    direction: 'TB',
}

interface LabelTreeFlowProps {
    initialNodes: Node[]
    initialEdges: Edge[]
    onNodeClick: (event: React.MouseEvent, node: Node) => void
}

export const LabelTreeFlow: React.FC<LabelTreeFlowProps> = ({
    initialNodes,
    initialEdges,
    onNodeClick,
}) => {
    const { fitView, updateNodeData } = useReactFlow()

    const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[])
    const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[])

    useEffect(() => {
        setNodes(initialNodes)
        setEdges(initialEdges)
    }, [initialNodes, initialEdges, setNodes, setEdges])

    useAutoLayout(defaultLayoutOptions)

    useEffect(() => {
        fitView()
    }, [nodes, fitView])

    const handleNodeClick = (event: React.MouseEvent, node: Node) => {
        onNodeClick(event, node)
        updateNodeData(node.id, { highlighted: !node.data.highlighted })
    }

    return (
        <div style={{ height: '50vh', width: '100%' }}>
            <ReactFlow
                nodes={nodes}
                nodeTypes={labelTreeNodeTypes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                elementsSelectable={false}
                nodesDraggable={false}
                onNodeClick={handleNodeClick}
                zoomOnDoubleClick={false}
            >
                <Background color="#fff" variant={BackgroundVariant.Lines} gap={0} />
                <Controls
                    onFitView={() => fitView()}
                    position="top-right"
                    showInteractive={false}
                />
            </ReactFlow>
        </div>
    )
}
