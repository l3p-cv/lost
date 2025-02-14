import { Edge, Node, useNodesInitialized, useReactFlow, useStore } from '@xyflow/react'
import { useEffect } from 'react'
import { getLayoutedElements } from '../../utils/graph-layout-util'

export type LayoutOptions = {
    direction: string
}

export const useAutoLayout = (options: LayoutOptions) => {
    const { setNodes, setEdges } = useReactFlow()
    const nodesInitialized = useNodesInitialized()

    const elements = useStore(
        (state) => ({
            nodes: state.nodes,
            edges: state.edges,
        }),
        compareElements,
    )

    useEffect(() => {
        console.log('here in useAutoLayout')
        if (!nodesInitialized || elements.nodes.length === 0) {
            return
        }

        const runLayout = async () => {
            // a copy so that original nodes are not mutated
            const nodes = elements.nodes.map((node) => ({ ...node }))
            const edges = elements.edges.map((edge) => ({ ...edge }))

            const { nodes: nextNodes, edges: nextEdges } = await getLayoutedElements(
                nodes,
                edges,
                options,
            )

            setNodes(nextNodes)
            setEdges(nextEdges)
        }

        runLayout()
    }, [nodesInitialized, elements, setNodes, setEdges, options])
}

type Elements = {
    nodes: Array<Node>
    edges: Array<Edge>
}

function compareElements(xs: Elements, ys: Elements) {
    return compareNodes(xs.nodes, ys.nodes) && compareEdges(xs.edges, ys.edges)
}

function compareNodes(xs: Array<Node>, ys: Array<Node>) {
    // the number of nodes changed, so we already know that the nodes are not equal
    if (xs.length !== ys.length) return false

    for (let i = 0; i < xs.length; i++) {
        const x = xs[i]
        const y = ys[i]

        // the node doesn't exist in the next state so it just got added
        if (!y) return false
        // We don't want to force a layout change while a user might be resizing a
        // node, so we only compare the dimensions if the node is not currently
        // being resized.
        //
        // We early return here instead of using a `continue` because there's no
        // scenario where we'd want nodes to start moving around *while* a user is
        // trying to resize a node or move it around.
        if (x.resizing || x.dragging) return true
        if (
            x.measured?.width !== y.measured?.width ||
            x.measured?.height !== y.measured?.height
        ) {
            return false
        }
    }

    return true
}

function compareEdges(xs: Array<Edge>, ys: Array<Edge>) {
    // the number of edges changed, so we already know that the edges are not equal
    if (xs.length !== ys.length) return false

    for (let i = 0; i < xs.length; i++) {
        const x = xs[i]
        const y = ys[i]

        if (x.source !== y.source || x.target !== y.target) return false
        if (x?.sourceHandle !== y?.sourceHandle) return false
        if (x?.targetHandle !== y?.targetHandle) return false
    }

    return true
}
