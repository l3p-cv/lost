import { CButton } from '@coreui/react'
import {
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    BackgroundVariant,
    Controls,
    Edge,
    EdgeChange,
    MarkerType,
    Node,
    NodeChange,
    Panel,
    ReactFlow,
    useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useCallback, useState } from 'react'
import '../globalComponents/node.scss'
import { AnnoTaskNode } from './AnnoTaskNode'
import { DataExportNode } from './DataExportNode'
import { DatasourceNode } from './DatasourceNode'
import * as demoJson from './demo.json'
import { getLayoutedElements } from './layout-util'
import { LoopNode } from './LoopNode'
import { ScriptNode } from './ScriptNode'
import './xy-theme.css'

const nodeTypes = {
    datasourceNode: DatasourceNode,
    annoTaskNode: AnnoTaskNode,
    dataExportNode: DataExportNode,
    loopNode: LoopNode,
    scriptNode: ScriptNode,
}

const parseElementsToReactFlow = () => {
    const elements = demoJson.elements
    const nodes: Node[] = elements.map((el) => {
        let type = ''
        if (el.datasource) type = 'datasourceNode'
        else if (el.script) type = 'scriptNode'
        else if (el.annoTask) type = 'annoTaskNode'
        else if (el.loop) type = 'loopNode'
        else if (el.dataExport) type = 'dataExportNode'

        return {
            id: el.peN.toString(),
            position: { x: 0, y: 0 }, // default positioning
            data: {
                label:
                    el.script?.name || el.annoTask?.name || el.datasource?.name || 'Node',
            },
            type,
        }
    })

    const edges: Edge[] = []
    elements.forEach((el) => {
        if (el.peOut) {
            el.peOut.forEach((targetId) => {
                edges.push({
                    id: `e${el.peN}-${targetId}`,
                    source: el.peN.toString(),
                    target: targetId.toString(),
                    markerEnd: {
                        type: MarkerType.Arrow,
                        width: 30,
                        height: 30,
                    },
                })
            })
        }
        if (el.loop && el.loop.peJumpId !== null) {
            edges.push({
                id: `e${el.peN}-${el.loop.peJumpId}`,
                source: el.peN.toString(),
                target: el.loop.peJumpId.toString(),
                markerEnd: {
                    type: MarkerType.Arrow,
                    width: 20,
                    height: 20,
                    color: 'red',
                },
                style: { stroke: 'red', strokeWidth: 2 },
                animated: true,
                type: 'smoothstep',
            })
        }
    })

    return { nodes, edges }
}

const onNodeClick = (event, node) => console.log('click node', node)

export const PipelineDemo = () => {
    const { fitView } = useReactFlow()
    const { nodes: initialNodes2, edges: initialEdges2 } = parseElementsToReactFlow()
    const [nodes, setNodes] = useState(initialNodes2)
    const [edges, setEdges] = useState(initialEdges2)

    const onNodesChange = useCallback(
        (changes: NodeChange<Node>[]) =>
            setNodes((nds) => applyNodeChanges(changes, nds)),
        [],
    )
    const onEdgesChange = useCallback(
        (changes: EdgeChange<Edge>[]) =>
            setEdges((eds) => applyEdgeChanges(changes, eds)),
        [],
    )

    const onLayout = useCallback(
        (direction: string) => {
            const layouted = getLayoutedElements(nodes, edges, { direction })

            setNodes([...layouted.nodes])

            setEdges([...layouted.edges])

            window.requestAnimationFrame(() => {
                fitView()
            })
        },
        [nodes, edges, fitView, setEdges, setNodes],
    )

    return (
        <div style={{ margin: 'auto', height: '90vh', width: '80%' }}>
            <ReactFlow
                nodes={nodes}
                nodeTypes={nodeTypes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                elementsSelectable={false}
                nodesDraggable={false}
                onNodeClick={onNodeClick}
            >
                <Background color="#fff" variant={BackgroundVariant.Lines} gap={0} />
                <Controls showInteractive={false} />
                <Panel position="top-right">
                    <CButton color="secondary" onClick={() => onLayout('TB')}>
                        Layout Top to Bottom
                    </CButton>
                </Panel>
            </ReactFlow>
        </div>
    )
}
