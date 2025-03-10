import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'

interface SubmitPipelineModalProps {
    isOpen: boolean
    toggle: () => void
}

export const SubmitPipelineModal = ({ isOpen, toggle }: SubmitPipelineModalProps) => {
    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader>Start Pipeline</ModalHeader>
            <ModalBody>
                <p>Are you sure you want to start this pipeline?</p>
            </ModalBody>
            <ModalFooter>
                <p>Blah</p>
            </ModalFooter>
        </Modal>
    )
}
