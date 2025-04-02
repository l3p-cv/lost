import { Input, Modal, ModalBody, ModalHeader } from 'reactstrap'
import { usePipelineLogs } from '../../../actions/pipeline/pipeline_api'

interface PipelineLogModalProps {
    pipelineId: string
    toggle: () => void
    isOpen: boolean
}
export const PipelineLogModal = ({
    isOpen,
    pipelineId,
    toggle,
}: PipelineLogModalProps) => {
    const { data: logs, isLoading, isError } = usePipelineLogs(pipelineId, isOpen)

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="xl">
            <ModalHeader toggle={toggle}>Pipeline Logs</ModalHeader>
            <ModalBody>
                {isLoading ? (
                    <Input type="textarea" value="Loading logs..." readOnly rows={10} />
                ) : isError ? (
                    <Input
                        type="textarea"
                        value="Error fetching logs."
                        readOnly
                        rows={10}
                    />
                ) : (
                    <Input type="textarea" value={logs} readOnly rows={10} />
                )}
            </ModalBody>
        </Modal>
    )
}
