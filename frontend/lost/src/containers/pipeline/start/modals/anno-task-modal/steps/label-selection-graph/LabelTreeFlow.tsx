import {
    Background,
    BackgroundVariant,
    Controls,
    Edge,
    getOutgoers,
    Node,
    ReactFlow,
    useEdgesState,
    useNodesState,
    useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { isEmpty } from 'lodash'
import { useEffect } from 'react'
import { LayoutOptions, useAutoLayout } from '../../../../../useAutoLayout'
import '../../../../../xy-theme.css'
import { LabelNode } from './LabelNode'

const labelTreeNodeTypes = {
    labelNode: LabelNode,
}

const defaultLayoutOptions: LayoutOptions = {
    direction: 'TB',
    ignoreDataChanges: true,
}

interface LabelTreeFlowProps {
    initialNodes: Node[]
    initialEdges: Edge[]
    onLabelSelect: (nodes: Node[], edges: Edge[]) => void
}

export const LabelTreeFlow: React.FC<LabelTreeFlowProps> = ({
    initialNodes,
    initialEdges,
    onLabelSelect,
}) => {
    const { fitView } = useReactFlow()

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

    const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
        const children = getOutgoers(node, nodes, edges)

        if (!isEmpty(children)) {
            setNodes((prevNodes) => {
                const updatedNodes = prevNodes.map((n) => {
                    if (n.id === node.id) {
                        // update the parent node
                        return {
                            ...n,
                            data: {
                                ...n.data,
                                selectedAsParent: !n.data.selectedAsParent,
                            },
                        }
                    } else if (children.some((child) => child.id === n.id)) {
                        // update child nodes
                        return { ...n, data: { ...n.data, selected: !n.data.selected } }
                    }
                    return n
                })

                // call onLabelSelect with the latest nodes and edges
                onLabelSelect(updatedNodes, edges)

                return updatedNodes
            })
        }
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
