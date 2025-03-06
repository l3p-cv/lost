import { Modal, ModalBody, ModalHeader } from 'reactstrap'
import {
    AvailableGroup,
    AvailableLabelTree,
} from '../../../../../actions/pipeline/model/pipeline-template-response'
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
    return (
        <>
            <Modal size="lg" isOpen={isOpen} toggle={toggle}>
                <ModalHeader>Annotation Task</ModalHeader>
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
