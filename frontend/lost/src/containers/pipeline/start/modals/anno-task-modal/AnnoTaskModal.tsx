import { Modal, ModalBody, ModalHeader } from 'reactstrap'
import {
    AvailableGroup,
    AvailableLabelTree,
} from '../../../../../actions/pipeline/model/pipeline-template-response'
import Stepper from './Stepper'

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
                    <Stepper />
                </ModalBody>
            </Modal>
        </>
    )
}
