import { Edge, Node } from '@xyflow/react'
import { LabelTreesResponse } from '../../../actions/label/label-trees-response'
import { getContrastColor } from '../../../utils/color-util'

export const convertLabelTreeToReactFlow = (tree: LabelTreesResponse) => {
    const nodes: Node[] = []
    const edges: Edge[] = []

    const traverse = (node: LabelTreesResponse, parentId: number | null = null) => {
        const nodeId = node.idx.toString()
        nodes.push({
            id: nodeId,
            type: 'labelEditorNode',
            position: { x: 0, y: 0 },
            data: {
                name: node.name,
                description: node.description,
                abbreviation: node.abbreviation,
                externalId: node.external_id,
                color: node.color || '#fff',
                textColor: getContrastColor(node.color || '#fff'),
            },
        })

        if (parentId) {
            edges.push({
                id: `e${parentId}-${nodeId}`,
                source: parentId.toString(),
                target: nodeId,
            })
        }

        node.children.forEach((child) => {
            traverse(child, node.idx)
        })
    }

    traverse(tree)

    return { nodes, edges }
}
