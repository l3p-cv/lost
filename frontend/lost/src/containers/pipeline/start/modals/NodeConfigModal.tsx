import {
  AvailableGroup,
  AvailableLabelTree,
  PipelineTemplateElement,
} from '../../../../actions/pipeline/model/pipeline-template-response'
import { AnnoTaskModal } from './anno-task-modal/AnnoTaskModal'
import { DatasourceModal } from './DatasourceModal'
import { LoopModal } from './LoopModal'
import { ScriptModal } from './ScriptModal'

interface NodeConfigModalProps {
  availableLabelTrees: AvailableLabelTree[]
  availableGroups: AvailableGroup[]
  toggleModal: () => void
  modalOpened: boolean
  modalData: PipelineTemplateElement | null
}

export const NodeConfigModal = ({
  modalData,
  availableLabelTrees,
  availableGroups,
  toggleModal,
  modalOpened,
}: NodeConfigModalProps) => {
  if (!modalData) return null

  const commonProps = {
    nodeId: modalData.peN.toString(),
    isOpen: modalOpened,
    toggle: toggleModal,
  }

  if (modalData.datasource) {
    return <DatasourceModal {...commonProps} datasource={modalData.datasource} />
  } else if (modalData.loop) {
    return <LoopModal {...commonProps} />
  } else if (modalData.script) {
    return <ScriptModal {...commonProps} script={modalData.script} />
  } else if (modalData.annoTask) {
    return (
      <AnnoTaskModal
        {...commonProps}
        availableGroups={availableGroups}
        availableLabelTrees={availableLabelTrees}
      />
    )
  }
}
