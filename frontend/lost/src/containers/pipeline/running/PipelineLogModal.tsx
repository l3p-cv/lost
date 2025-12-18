import { usePipelineLogs } from '../../../actions/pipeline/pipeline_api'
import { CFormTextarea } from '@coreui/react'
import BaseModal from '../../../components/BaseModal'

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
    <BaseModal
      title="Pipeline Logs"
      isOpen={isOpen}
      onClosed={() => {
        if (isOpen) {
          toggle()
        }
      }}
      size="xl"
    >
      {isLoading ? (
        <CFormTextarea value="Loading logs..." readOnly rows={10} />
      ) : isError ? (
        <CFormTextarea value="Error fetching logs." readOnly rows={10} />
      ) : (
        <CFormTextarea value={logs} readOnly rows={10} />
      )}
    </BaseModal>
  )
}
