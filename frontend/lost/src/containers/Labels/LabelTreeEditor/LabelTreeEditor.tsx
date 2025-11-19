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
    const childIds = new Set(initialEdges.map((e) => e.target))

    const processedNodes = initialNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        is_root: !childIds.has(node.id),
      },
    }))

    setNodes(processedNodes)
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
            const joyrideRunning = localStorage.getItem('joyrideRunning') === 'true'

            setEdges((prevEdges) => {
              setNodes((prevNodes) => {
                const childCount = prevNodes.filter((n) =>
                  prevEdges.find((e) => e.source === node.id && e.target === n.id),
                ).length

                let childClass = 'new-label-node'

                if (joyrideRunning) {
                  if (childCount === 0) childClass += ' first-label-node'
                  else if (childCount === 1) childClass += ' second-label-node'
                  else if (childCount === 2) {
                    childClass += ' third-label-node'
                    window.dispatchEvent(
                      new CustomEvent('joyride-next-step', {
                        detail: { step: 'create-label' },
                      }),
                    )
                  }
                }

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
                    is_root: false,
                  } as LabelEditorNodeData,
                  position: { x: 0, y: 0 }, // no need to pass a position as it is computed by the layout hook
                  className: childClass,
                }
                // Add new node and edge to the graph
                const newNodes = [...prevNodes, childNode]
                // Add new edge to edges in outer setEdges call
                const newEdge = {
                  id: `${node.id}-${childNode.id}`,
                  source: node.id,
                  target: childNode.id,
                }
                setEdges([...prevEdges, newEdge])

                return newNodes
              })

              return prevEdges
            })
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
