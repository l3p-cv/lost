import { CCol, CRow } from '@coreui/react'
import { useNodesData, useReactFlow } from '@xyflow/react'
import Select from 'react-select'
import { AvailableLabelTree } from '../../../../../../types/pipelines/pipeline-template-response'
import { AnnoTaskNodeData } from '../../../nodes'
import InfoText from '../../../../../../components/InfoText'

interface SelectTreeProps {
  nodeId: string
  availableLabelTrees: AvailableLabelTree[]
}

export const SelectTree = ({ nodeId, availableLabelTrees }: SelectTreeProps) => {
  const { updateNodeData } = useReactFlow()
  const nodeData = useNodesData(nodeId)
  const annoTaskNodeData = nodeData?.data as AnnoTaskNodeData

  const selectTree = (selectedOption) => {
    if (!selectedOption) return

    updateNodeData(nodeId, {
      selectedLabelTree: selectedOption,
      labelTreeGraph: {
        nodes: [],
        edges: [],
      },
    })
    const joyrideRunning = localStorage.getItem('joyrideRunning') === 'true'
    if (joyrideRunning) {
      window.dispatchEvent(
        new CustomEvent('joyride-next-step', {
          detail: { step: 'label-tree-selection-done' },
        }),
      )
    }
  }

  return (
    <div>
      <h4 className="mb-3 text-center">Label Tree Selection</h4>
      <CRow className="justify-content-center">
        <CCol sm="6">
          <InfoText
            id="anno-user-select"
            text={'Label Tree:'}
            toolTip={
              'Choose a label tree to categorize your annotations. You can select the labels in the next step.'
            }
            style={{ fontSize: 20, marginBottom: '10px' }}
          />
          <Select
            options={availableLabelTrees}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.idx.toString()}
            onChange={selectTree}
            placeholder="Select a label tree..."
            id="treeSelect"
            defaultValue={annoTaskNodeData.selectedLabelTree}
          />
        </CCol>
      </CRow>
    </div>
  )
}
