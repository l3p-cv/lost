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
import { useCallback, useEffect, useState } from 'react'
import { CreateLabelResponse, useCreateLabel } from '../../../actions/label/label-api'
import { LayoutOptions, useAutoLayout } from '../../pipeline/useAutoLayout'
import LabelEditorControls from './LabelEditorControls'
import { LabelEditorNode, LabelEditorNodeData } from './LabelEditorNode'
import './xy-theme.css'

const labelTreeNodeTypes = {
    labelEditorNode: LabelEditorNode,
}

const defaultLayoutOptions: LayoutOptions = {
    direction: 'TB',
    ignoreDataChanges: false,
}

interface LabelTreeFlowProps {
    initialNodes: Node[]
    initialEdges: Edge[]
    visLevel: string
    readonly?: boolean
}

export const LabelTreeEditor: React.FC<LabelTreeFlowProps> = ({
    initialNodes,
    initialEdges,
    visLevel,
    readonly = false,
}) => {
    const { fitView } = useReactFlow()

    const [selectedNodeId, setSelectedNodeId] = useState<string>('')
    const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[])
    const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[])
    const { mutate: createLabel } = useCreateLabel()

    useEffect(() => {
        setNodes(initialNodes)
        setEdges(initialEdges)
    }, [initialNodes, initialEdges, setNodes, setEdges])

    useAutoLayout(defaultLayoutOptions)

    useEffect(() => {
        fitView()
    }, [nodes, fitView])

    const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
        if (readonly) return
        setSelectedNodeId(node.id)
    }

    const handleNodeContextMenu = useCallback(
        (event: React.MouseEvent, node: Node) => {
            if (readonly) return

            event.preventDefault()
            createLabel(
                {
                    data: {
                        name: 'New Label',
                        description: '',
                        abbreviation: '',
                        extID: '',
                        color: '#ffffff',
                        is_root: false,
                        parent_leaf_id: node.id,
                    },
                    visLevel,
                },
                {
                    onSuccess: (response: CreateLabelResponse) => {
                        const childNode: Node = {
                            id: response.labelId.toString(),
                            type: 'labelEditorNode',
                            data: {
                                name: 'New Label',
                                description: '',
                                abbreviation: '',
                                externalId: '',
                                color: '#ffffff',
                                textColor: '#000000',
                            } as LabelEditorNodeData,
                            position: { x: 0, y: 0 }, // no need to pass a position as it is computed by the layout hook
                        }
                        // Add new node and edge to the graph
                        setNodes((prevNodes) => [...prevNodes, childNode])
                        setEdges((prevEdges) => [
                            ...prevEdges,
                            {
                                id: `${node.id}-${childNode.id}`,
                                source: node.id,
                                target: childNode.id,
                            },
                        ])
                    },
                },
            )
        },
        [createLabel, readonly, setEdges, setNodes, visLevel],
    )

    return (
        <>
            {!readonly && (
                <LabelEditorControls
                    nodeId={selectedNodeId}
                    onClearSelectedLabel={() => setSelectedNodeId('')}
                    visLevel={visLevel}
                />
            )}
            <div style={{ height: '75vh', width: '100%' }}>
                <ReactFlow
                    nodes={nodes}
                    nodeTypes={labelTreeNodeTypes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    elementsSelectable={!readonly}
                    nodesDraggable={false}
                    onNodeClick={handleNodeClick}
                    onNodeContextMenu={handleNodeContextMenu}
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
        </>
    )
}
