import Dagre from '@dagrejs/dagre'
import { Edge, Node } from '@xyflow/react'

export const getLayoutedElements = async (
    nodes: Node[],
    edges: Edge[],
    options: { direction: string },
) => {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}))

    g.setGraph({ rankdir: options.direction })

    for (const edge of edges) {
        g.setEdge(edge.source, edge.target)
    }

    for (const node of nodes) {
        g.setNode(node.id, {
            ...node,
            width: node.measured?.width ?? 0,
            height: node.measured?.height ?? 0,
        })
    }

    Dagre.layout(g)

    return {
        nodes: nodes.map((node) => {
            const position = g.node(node.id)
            // We are shifting the dagre node position (anchor=center center) to the top left
            // so it matches the React Flow node anchor point (top left).
            const x = position.x - (node.measured?.width ?? 0) / 2
            const y = position.y - (node.measured?.height ?? 0) / 2

            return { ...node, position: { x, y } }
        }),
        edges,
    }
}
