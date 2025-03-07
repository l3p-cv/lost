import { CAlert } from '@coreui/react'
import { Edge, Node, ReactFlowProvider, useNodesData, useReactFlow } from '@xyflow/react'
import { useEffect, useState } from 'react'
import { FaInfoCircle } from 'react-icons/fa'
import { Card, CardBody } from 'reactstrap'
import { AvailableLabelTree } from '../../../../../../actions/pipeline/model/pipeline-template-response'
import { AnnoTaskNodeData } from '../../../nodes'
import { LabelTreeFlow } from './label-selection-graph/LabelTreeFlow'
import { convertLabelTreeToReactFlow } from './label-selection-graph/label-tree-util'

interface SelectLabelProps {
    availableLabelTrees: AvailableLabelTree[]
    nodeId: string
}

export const SelectLabel = ({ availableLabelTrees, nodeId }: SelectLabelProps) => {
    const nodeData = useNodesData(nodeId) // node data of the pipeline
    const { labelTreeId } = nodeData?.data as AnnoTaskNodeData
    const { updateNodeData } = useReactFlow()

    const [nodes, setNodes] = useState<Node[]>([]) // nodes of the label tree
    const [edges, setEdges] = useState<Edge[]>([])

    useEffect(() => {
        if (labelTreeId) {
            const selectedLabelTree = availableLabelTrees.find(
                (tree) => tree.idx === labelTreeId,
            )

            const { nodes, edges } = convertLabelTreeToReactFlow(selectedLabelTree!)
            setNodes(nodes)
            setEdges(edges)
        }
    }, [availableLabelTrees, nodeId, labelTreeId])

    return (
        <ReactFlowProvider>
            <h4 className="mb-3 text-center">Label Selection</h4>
            <Card>
                <CardBody>
                    <CAlert color="secondary" dismissible>
                        <div className="d-flex align-items-center">
                            <FaInfoCircle className="me-2" size={20} />
                            <p className="mb-0">
                                Click a parent label to activate all child labels in the
                                Annotation Task. Labels active in Annotation Task have a
                                bold red border in this view.
                            </p>
                        </div>
                    </CAlert>
                    <LabelTreeFlow
                        initialNodes={nodes}
                        initialEdges={edges}
                        onNodeClick={() => {}}
                    />
                </CardBody>
            </Card>
        </ReactFlowProvider>
    )
}
