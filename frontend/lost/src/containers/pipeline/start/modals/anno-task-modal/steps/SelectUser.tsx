import { CBadge, CCol, CRow } from '@coreui/react'
import { useNodesData, useReactFlow } from '@xyflow/react'
import Select from 'react-select'
import { AvailableGroup } from '../../../../../../actions/pipeline/model/pipeline-template-response'
import HelpButton from '../../../../../../components/HelpButton'
import { AnnoTaskNodeData } from '../../../nodes'

interface SelectUserProps {
  nodeId: string
  availableGroups: AvailableGroup[]
}

export const SelectUser = ({ nodeId, availableGroups }: SelectUserProps) => {
  const { updateNodeData } = useReactFlow()
  const nodeData = useNodesData(nodeId)
  const annoTaskNodeData = nodeData?.data as AnnoTaskNodeData

  const selectUser = (selectedOption) => {
    if (!selectedOption) return

    updateNodeData(nodeId, {
      selectedUserGroup: selectedOption,
    } as AnnoTaskNodeData)

    const joyrideRunning = localStorage.getItem('joyrideRunning') === 'true'
    if (joyrideRunning) {
      window.dispatchEvent(
        new CustomEvent('joyride-next-step', { detail: { step: 'user-selection-done' } }),
      )
    }
  }

  const formatOptionLabel = (option) => (
    <div className="d-flex align-items-center">
      <CBadge
        color={option.isUserDefault ? 'success' : 'primary'}
        shape="pill"
        className="me-2"
      >
        {option.isUserDefault ? 'User' : 'Group'}
      </CBadge>
      <span>{option.name}</span>
    </div>
  )

  return (
    <div>
      <h4 className="mb-3 text-center">User Selection</h4>
      <CRow className="justify-content-center">
        <CCol sm="6">
          <span className="py-1 fs-6 text-muted fw-bold">User or Group &nbsp;</span>
          <HelpButton
            id="anno-user-select"
            text="Select a user or group to assign this annotation task."
          />
          <Select
            options={availableGroups}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.id.toString()}
            formatOptionLabel={formatOptionLabel}
            onChange={selectUser}
            placeholder="Select a user or group..."
            id="userSelect"
            defaultValue={annoTaskNodeData.selectedUserGroup}
          />
        </CCol>
      </CRow>
    </div>
  )
}
