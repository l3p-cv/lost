import { Edge, Node } from '@xyflow/react'
import { AvailableLabelTree } from '../../../../../../../actions/pipeline/model/pipeline-template-response'

const getContrastColor = (hex: string) => {
    hex = hex.replace(/^#/, '')

    if (hex.length === 3) {
        hex = hex
            .split('')
            .map((char) => char + char)
            .join('')
    }

    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

    return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

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
