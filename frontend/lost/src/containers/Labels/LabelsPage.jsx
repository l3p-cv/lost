import React, { useEffect, useRef, useState } from 'react'
import ReactFlow from 'reactflow'

import 'reactflow/dist/style.css'
import EditLabel from './EditLabel'

const LabelsPage = ({
    labelTree,
    triggerRefetch,
    onNoNodes = () => {},
    visLevel,
    showEdit = true,
    onNodeClick = (nodeId) => {},
    highlightedNodeIds = [], // New prop for highlighted node IDs
}) => {
    const [selectedLabel, setSelectedLabel] = useState(null)
    const [rerender, setRerender] = useState(false)
    const divRef = useRef(null)
    const getContrastColor = (hexColor) => {
        hexColor = hexColor.replace('#', '')

        const r = parseInt(hexColor.substring(0, 2), 16)
        const g = parseInt(hexColor.substring(2, 4), 16)
        const b = parseInt(hexColor.substring(4, 6), 16)

        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

        return luminance > 0.5 ? '#000000' : '#ffffff'
    }

    const getMaxDepth = (node) => {
        if (!node.children || node.children.length === 0) {
            return 1 // A leaf node has a depth of 1
        }
        return 1 + Math.max(...node.children.map(getMaxDepth))
    }

    const generateNodesAndEdges = (tree) => {
        const nodes = []
        const edges = []

        const addNode = (node, depth, xOffset) => {
            const verticalSpacing = 150 // Adjust the spacing between levels
            let horizontalSpacing = 155 // Adjust the spacing between siblings
            const maxDepth = getMaxDepth(labelTree)
            if (depth === 0) {
                horizontalSpacing = 200 + (maxDepth - 1) * 50
            }

            // Determine if the node should be highlighted
            const isHighlighted = highlightedNodeIds.includes(node.idx)

            // Calculate the position
            const nodeX = xOffset
            const nodeY = depth * verticalSpacing

            nodes.push({
                id: node.idx.toString(),
                position: { x: nodeX, y: nodeY },
                data: { label: node.name },
                style: {
                    backgroundColor: node.color || '#FFFFFF', // Highlight color
                    color: getContrastColor(node.color || '#FFFFFF'),
                    border: isHighlighted ? '3px solid #000000' : undefined, // Highlight border
                    fontWeight: isHighlighted ? 'bold' : 'normal',
                },
            })

            // Add edges and process children
            if (node.children && node.children.length > 0) {
                const totalWidth = (node.children.length - 1) * horizontalSpacing
                let childXOffset = nodeX - totalWidth / 2

                node.children.forEach((child) => {
                    edges.push({
                        id: `${node.idx}-${child.idx}`,
                        source: node.idx.toString(),
                        target: child.idx.toString(),
                    })

                    addNode(child, depth + 1, childXOffset)
                    childXOffset += horizontalSpacing
                })
            }
        }

        addNode(tree, 0, 0) // Start at depth 0 with xOffset 0
        return { nodes, edges }
    }

    const { nodes: initialNodes, edges: initialEdges } = generateNodesAndEdges(labelTree)

    const clearSelectedLabel = () => {
        setSelectedLabel(null)
    }

    const findNodeById = (node, targetIdx) => {
        if (node.idx === targetIdx) return node
        return (
            node.children
                ?.map((child) => findNodeById(child, targetIdx))
                .find((result) => result) || null
        )
    }

    const selectLabel = (id) => {
        if (id) setSelectedLabel(findNodeById(labelTree, id))
    }

    useEffect(() => {
        setRerender((r) => !r)
    }, [labelTree, highlightedNodeIds]) // Re-render when highlightedNodeIds change

    const renderEditLabel = () => {
        if (selectedLabel === null) selectLabel(labelTree.idx)

        if (!(labelTree.group_id === null)) {
            return (
                <div ref={divRef}>
                    <EditLabel
                        label={selectedLabel}
                        clearSelectedLabel={clearSelectedLabel}
                        visLevel={visLevel}
                    />
                </div>
            )
        }
        return null
    }

    return (
        <>
            {showEdit && renderEditLabel()}
            <div style={{ width: '100%', height: '50vh' }}>
                <ReactFlow
                    key={rerender ? 0 : 1}
                    onNodeClick={(e, node) => {
                        selectLabel(parseInt(node.id, 10))
                        onNodeClick(node.id)
                    }}
                    minZoom={0.1}
                    fitView
                    nodes={initialNodes}
                    edges={initialEdges}
                    elevateNodesOnSelect
                />
            </div>
        </>
    )
}

export default LabelsPage
