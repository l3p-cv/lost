import { CAlert } from '@coreui/react'
import { Edge, Node, ReactFlowProvider, useNodesData, useReactFlow } from '@xyflow/react'
import { isEmpty } from 'lodash'
import { useEffect, useState } from 'react'
import { FaInfoCircle } from 'react-icons/fa'
import { AvailableLabelTree } from '../../../../../../actions/pipeline/model/pipeline-template-response'
import { AnnoTaskNodeData } from '../../../nodes'
import { LabelTreeFlow } from './label-selection-graph/LabelTreeFlow'
import { convertLabelTreeToReactFlow } from './label-selection-graph/label-tree-util'
import { CCard, CCardBody } from '@coreui/react'

interface SelectLabelProps {
    availableLabelTrees: AvailableLabelTree[]
    nodeId: string
}

export const SelectLabel = ({ availableLabelTrees, nodeId }: SelectLabelProps) => {
    const nodeData = useNodesData(nodeId) // node data of the pipeline
    const { selectedLabelTree, labelTreeGraph } = nodeData?.data as AnnoTaskNodeData
    const { updateNodeData } = useReactFlow()

    const [nodes, setNodes] = useState<Node[]>([]) // nodes of the label tree
    const [edges, setEdges] = useState<Edge[]>([])

    useEffect(() => {
        if (selectedLabelTree) {
            if (!isEmpty(labelTreeGraph.nodes)) {
                setNodes(labelTreeGraph.nodes)
                setEdges(labelTreeGraph.edges)
            } else {
                const { nodes: labelTreeNodes, edges: labelTreeEdges } =
                    convertLabelTreeToReactFlow(selectedLabelTree)
                setNodes(labelTreeNodes)
                setEdges(labelTreeEdges)
            }
        }
    }, [labelTreeGraph, availableLabelTrees, selectedLabelTree])

    const handleLabelSelect = (labelTreeNodes: Node[], labelTreeEdges: Edge[]) => {
        updateNodeData(nodeId, {
            labelTreeGraph: {
                nodes: labelTreeNodes,
                edges: labelTreeEdges,
            },
        })
        const joyrideRunning = localStorage.getItem('joyrideRunning') === 'true';
        if (joyrideRunning) {
            window.dispatchEvent(
                new CustomEvent('joyride-next-step', { detail: { step: 'label-selection-done' } })
            );
        }
    }

    return (
        <div  id="select-label-container">
            <ReactFlowProvider>
            <h4 className="mb-3 text-center">Label Selection</h4>
            <CCard>
                <CCardBody>
                    <CAlert color="secondary" dismissible>
                        <div className="d-flex align-items-center">
                            <FaInfoCircle className="me-2" size={20} />
                            <p className="mb-0">
                                Click a parent label to activate all child labels in the
                                Annotation Task. Labels active in Annotation Task are
                                colored.
                            </p>
                        </div>
                    </CAlert>
                    <LabelTreeFlow
                        initialNodes={nodes}
                        initialEdges={edges}
                        onLabelSelect={handleLabelSelect}
                    />
                </CCardBody>
            </CCard>
        </ReactFlowProvider></div>
    )
}
