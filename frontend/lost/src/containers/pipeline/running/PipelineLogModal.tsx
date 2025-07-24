import { usePipelineLogs } from '../../../actions/pipeline/pipeline_api'
import { CFormTextarea, CModal, CModalBody, CModalHeader } from '@coreui/react'

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
        <CModal visible={isOpen} onClose={ () => {
            if (isOpen){
                    toggle()
            }
        }}   
        size="xl">
            <CModalHeader>Pipeline Logs</CModalHeader>
            <CModalBody>
                {isLoading ? (
                    <CFormTextarea value="Loading logs..." readOnly rows={10} />
                ) : isError ? (
                    <CFormTextarea
                        value="Error fetching logs."
                        readOnly
                        rows={10}
                    />
                ) : (
                    <CFormTextarea value={logs} readOnly rows={10} />
                )}
            </CModalBody>
        </CModal>
    )
}
