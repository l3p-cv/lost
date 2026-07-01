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
import { useCallback, useEffect, useRef, useState } from 'react'
import { CreateLabelResponse, useCreateLabel } from '../../../api/label'
import { generateRandomColor } from '../../../utils/color-util'
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
  onDirtyChange?: (hasDirty: boolean) => void
}

export const LabelTreeEditor: React.FC<LabelTreeFlowProps> = ({
  initialNodes,
  initialEdges,
  visLevel,
  readonly = false,
  onDirtyChange,
}) => {
  const { fitView, updateNodeData } = useReactFlow()

  const [selectedNodeId, setSelectedNodeId] = useState<string>('')
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[])
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[])
  const [dirtyNodeIds, setDirtyNodeIds] = useState<Set<string>>(new Set())
  const { mutate: createLabel } = useCreateLabel()
  const originalNodeDataRef = useRef<Map<string, LabelEditorNodeData>>(new Map())

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

    // capture original server-side data per node for dirty tracking
    processedNodes.forEach((node) => {
      originalNodeDataRef.current?.set(node.id, { ...node.data } as LabelEditorNodeData)
    })
  }, [initialNodes, initialEdges, setNodes, setEdges])

  useAutoLayout(defaultLayoutOptions)

  useEffect(() => {
    fitView({ duration: 400 })
  }, [nodes.length, fitView])

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    if (readonly) return
    setSelectedNodeId(node.id)
  }

  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (readonly) return

      event.preventDefault()

      const hasBase = nodes.some((n) => String(n.data.name).trim() === 'New Label')

      const existingNumbers = nodes
        .map((n) => {
          const match = String(n.data.name).match(/^New Label \((\d+)\)$/)
          return match ? parseInt(match[1], 10) : null
        })
        .filter((n): n is number => n !== null)

      const newLabelName = !hasBase
        ? 'New Label'
        : `New Label (${existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1})`

      const existingColors = nodes.map((n) => String(n.data.color)).filter(Boolean)
      const randomColor = generateRandomColor(existingColors)

      createLabel(
        {
          data: {
            name: newLabelName,
            description: '',
            abbreviation: '',
            extID: '',
            color: randomColor,
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

                const childNodeData: LabelEditorNodeData = {
                  name: newLabelName,
                  description: '',
                  abbreviation: '',
                  externalId: '',
                  color: randomColor,
                  textColor: '#000000',
                  is_root: false,
                }

                const childNode: Node = {
                  id: response.labelId.toString(),
                  type: 'labelEditorNode',
                  data: childNodeData,
                  position: { x: 0, y: 0 }, // no need to pass a position as it is computed by the layout hook
                  className: childClass,
                }

                // register in original data map so dirty tracking works on newly created nodes
                originalNodeDataRef.current?.set(childNode.id, { ...childNodeData })
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
    [createLabel, nodes, readonly, setEdges, setNodes, visLevel],
  )

  return (
    <>
      {!readonly && (
        <LabelEditorControls
          nodeId={selectedNodeId}
          onClearSelectedLabel={() => setSelectedNodeId('')}
          visLevel={visLevel}
          originalNodeDataRef={originalNodeDataRef}
          onMarkDirty={(nodeId) => {
            updateNodeData(nodeId, { isDirty: true })
            setDirtyNodeIds((prev) => {
              const next = new Set(prev).add(nodeId)
              onDirtyChange?.(next.size > 0)
              return next
            })
          }}
          onMarkClean={(nodeId) => {
            updateNodeData(nodeId, { isDirty: false })
            setDirtyNodeIds((prev) => {
              const next = new Set(prev)
              next.delete(nodeId)
              onDirtyChange?.(next.size > 0)
              return next
            })
          }}
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
