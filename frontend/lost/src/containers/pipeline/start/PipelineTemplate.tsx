import {
    Background,
    BackgroundVariant,
    Controls,
    Edge,
    Node,
    Panel,
    ReactFlow,
    useEdgesState,
    useNodesState,
    useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useEffect } from 'react'
import '../globalComponents/node.scss'
import { LayoutOptions, useAutoLayout } from '../useAutoLayout'
import '../xy-theme.css'
import {
    AnnoTaskNode,
    DataExportNode,
    DatasourceNode,
    LoopNode,
    ScriptNode,
} from './nodes'

const templateNodeTypes = {
    datasourceNode: DatasourceNode,
    annoTaskNode: AnnoTaskNode,
    dataExportNode: DataExportNode,
    loopNode: LoopNode,
    scriptNode: ScriptNode,
}

const defaultLayoutOptions: LayoutOptions = {
    direction: 'TB',
}

interface PipelineTemplateProps {
    name: string
    initialNodes: Node[]
    initialEdges: Edge[]
    onNodeClick: (event: React.MouseEvent, node: Node) => void
}

export const PipelineTemplate: React.FC<PipelineTemplateProps> = ({
    name,
    initialNodes,
    initialEdges,
    onNodeClick,
}) => {
    const { fitView } = useReactFlow()

    const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[])
    const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[])

  useEffect(() => {
    const nodesWithClassNames = initialNodes.map((node) => {
      let className = '';
      if (node.type === 'datasourceNode') className = 'datasource-node';
      if (node.type === 'scriptNode') className = 'script-node';
      if (node.type === 'annoTaskNode') className = 'anno-task-node';
      return { ...node, className };
    });

    setNodes(nodesWithClassNames)
    setEdges(initialEdges)
  }, [initialNodes, initialEdges])

  useAutoLayout(defaultLayoutOptions)

  useEffect(() => {
    fitView({ maxZoom: 1.0 })
  }, [nodes, fitView])

  return (
    <div style={{ height: '90vh', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        nodeTypes={templateNodeTypes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        elementsSelectable={false}
        nodesDraggable={false}
        onNodeClick={onNodeClick}
        zoomOnDoubleClick={false}
      >
        <Background color="#fff" variant={BackgroundVariant.Lines} gap={0} />
        <Controls
          onFitView={() => fitView({ maxZoom: 1.0 })}
          position="top-right"
          showInteractive={false}
        />
        <Panel position="top-left">
          <p>Name : {name}</p>
        </Panel>
      </ReactFlow>
    </div>
  )
}
