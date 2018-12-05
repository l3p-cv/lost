export default function flattenTree(tree){
    if(!tree){
        throw new Error(`Parameter 'tree' is undefined.`)
    }

    const nodes = [{
        id: tree.idx,
        label: tree.name,
        color: "#e09c41",
    }]
    const edges = tree.children.map(c => ({
        from: tree.idx,
        to: c.idx,
    }))

    function fillGraph(tree, nodes, edges){
        if(tree.children) {
            tree.children.forEach(c => {
                const mapNode = {
                    id: c.idx,
                    label: c.name,
                    color: "#e04141",
                }
                const mapEdge = {
                    from: tree.idx,
                    to: c.idx,
                }
                nodes.push(mapNode)
                edges.push(mapEdge)
                fillGraph(c, nodes, edges)
            })
        }
    }
    fillGraph(tree, nodes, edges)

    return {
        nodes: nodes,
        edges: edges,
    }
}
