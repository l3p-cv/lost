import styles from './styles'

export default function mapTreeToGraph(tree, options) {
    if (!tree) {
        throw new Error(`Parameter 'tree' is undefined.`)
    }

    // function mapNode(node){
    // 	return {
    // 		id: node.idx,
    // 		label: node.name,
    // 	}
    // }
    // function mapEdge(node){
    // 	return node.children.map(child => ({
    // 		from: node.idx,
    // 		to: child.idx,
    // 	}))
    // }

    let nodes = [
        Object.assign({}, styles.nodes, {
            color: tree.color ? tree.color : '#10515F',
            id: tree.idx,
            label: tree.name,
        }),
    ]
    let edges = tree.children.map((c) =>
        Object.assign({}, styles.edges, {
            from: tree.idx,
            to: c.idx,
        }),
    )

    fillGraph(tree, nodes, edges)
    function fillGraph(tree, nodes, edges) {
        if (tree.children) {
            tree.children.forEach((c) => {
                nodes.push(
                    Object.assign({}, styles.nodes, {
                        id: c.idx,
                        label: c.name,
                        isLeaf: c.children.length === 0,
                        color: c.color ? c.color : '#10515F',
                    }),
                )
                edges.push(
                    Object.assign({}, styles.edges, {
                        from: tree.idx,
                        to: c.idx,
                        isLeaf: c.children.length === 0,
                    }),
                )
                fillGraph(c, nodes, edges)
            })
        }
    }

    if (options) {
        const { customizeNodes, customizeEdges } = options
        if (customizeNodes) {
            nodes = customizeNodes(nodes)
        }
        if (customizeEdges) {
            edges = customizeEdges(edges)
        }
    }

    return {
        nodes: nodes,
        edges: edges,
    }
}
