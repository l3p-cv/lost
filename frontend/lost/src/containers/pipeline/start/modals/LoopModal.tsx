import { useNodesData, useReactFlow } from '@xyflow/react'
import { useCallback } from 'react'
import { CCol, CFormInput, CRow } from '@coreui/react'
import { LoopNodeData } from '../nodes'
import BaseModal from '../../../../components/BaseModal'
import InfoText from '../../../../components/InfoText'

interface LoopModalProps {
  nodeId: string
  isOpen: boolean
  toggle: () => void
}

export const LoopModal = ({ nodeId, isOpen, toggle }: LoopModalProps) => {
  const nodeData = useNodesData(nodeId)
  const loopNodeData = nodeData?.data as LoopNodeData

  const { updateNodeData } = useReactFlow()

  const onInput = useCallback(
    (e) => {
      const number = Number(e.target.value)
      if (!isNaN(number)) {
        updateNodeData(nodeId, {
          maxIteration: number,
        })
      }
    },
    [nodeId, updateNodeData],
  )

  return (
    <BaseModal
      isOpen={isOpen}
      onClosed={() => {
        if (isOpen) {
          toggle()
        }
      }}
      title="Loop"
      size="lg"
    >
      <CRow style={{ marginLeft: '15px' }}>
        <CCol sm="3" className="align-self-center">
          <InfoText text={'Max Iteration: '} style={{ fontSize: 20 }} />
        </CCol>
        <CCol>
          {typeof loopNodeData.maxIteration === 'number' ? (
            <CFormInput
              min={-1}
              onInput={onInput}
              defaultValue={loopNodeData.maxIteration}
              placeholder="Amount"
              type="number"
              step="1"
            />
          ) : (
            <b>'Infinity'</b>
          )}
        </CCol>
      </CRow>
    </BaseModal>
  )
}
