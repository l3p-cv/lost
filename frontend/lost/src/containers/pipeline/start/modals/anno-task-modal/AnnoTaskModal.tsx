import { useNodesData, useReactFlow } from '@xyflow/react'
import { isEmpty } from 'lodash'
import { useCallback } from 'react'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'
import {
    AvailableGroup,
    AvailableLabelTree,
} from '../../../../../actions/pipeline/model/pipeline-template-response'
import { AnnoTaskNodeData } from '../../nodes'
import { AnnoTaskStepper } from './AnnoTaskStepper'

interface AnnoTaskModalProps {
    toggle: () => void
    isOpen: boolean
    nodeId: string
    availableLabelTrees: AvailableLabelTree[]
    availableGroups: AvailableGroup[]
}

export const AnnoTaskModal = ({
    toggle,
    isOpen,
    nodeId,
    availableGroups,
    availableLabelTrees,
}: AnnoTaskModalProps) => {
    const nodeData = useNodesData(nodeId)
    const annoTaskNodeData = nodeData?.data as AnnoTaskNodeData
    const { updateNodeData } = useReactFlow()

    const verifyNode = useCallback(() => {
        if (
            !isEmpty(annoTaskNodeData.name.trim()) &&
            annoTaskNodeData.instructionId !== undefined &&
            !isEmpty(annoTaskNodeData.selectedUserGroup) &&
            !isEmpty(annoTaskNodeData.selectedLabelTree) &&
            annoTaskNodeData.labelTreeGraph.nodes.some(
                (node) => node.data.selectedAsParent,
            )
        ) {
            updateNodeData(nodeId, {
                verified: true,
            })
        } else {
            updateNodeData(nodeId, {
                verified: false,
            })
        }
    }, [
        annoTaskNodeData.instructionId,
        annoTaskNodeData.labelTreeGraph.nodes,
        annoTaskNodeData.name,
        annoTaskNodeData.selectedLabelTree,
        annoTaskNodeData.selectedUserGroup,
        nodeId,
        updateNodeData,
    ])

    return (
        <>
            <Modal size="lg" isOpen={isOpen} toggle={toggle} onClosed={verifyNode}>
                <ModalHeader toggle={toggle}>Annotation Task</ModalHeader>
                <ModalBody>
                    <AnnoTaskStepper
                        nodeId={nodeId}
                        availableGroups={availableGroups}
                        availableLabelTrees={availableLabelTrees}
                        toggleModal={toggle}
                    />
                </ModalBody>
            </Modal>
        </>
    )
}
