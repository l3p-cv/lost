import { Edge, Node } from '@xyflow/react'
import { AvailableLabelTree } from '../../../../../../../actions/pipeline/model/pipeline-template-response'
import { getContrastColor } from '../../../../../../../utils/color-util'

export const convertLabelTreeToReactFlow = (
  tree: AvailableLabelTree,
  parentId?: string,
) => {
  let nodes: Node[] = []
  let edges: Edge[] = []

  const nodeId = tree.idx.toString()
  nodes.push({
    id: nodeId,
    type: 'labelNode',
    position: { x: 0, y: 0 },
    data: {
      label: tree.name,
      selected: false,
      backgroundColor: tree.color || '#fff',
      color: getContrastColor(tree.color || '#fff'),
    },
  })

  if (parentId) {
    edges.push({
      id: `e${parentId}-${nodeId}`,
      source: parentId.toString(),
      target: nodeId,
    })
  }

  if (tree.children && tree.children.length) {
    tree.children.forEach((child) => {
      const { nodes: childNodes, edges: childEdges } = convertLabelTreeToReactFlow(
        child,
        nodeId,
      )
      nodes = nodes.concat(childNodes)
      edges = edges.concat(childEdges)
    })
  }

  return { nodes, edges }
}
