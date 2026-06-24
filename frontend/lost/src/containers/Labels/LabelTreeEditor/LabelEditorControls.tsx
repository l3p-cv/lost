import { faCheck, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useNodesData, useReactFlow } from '@xyflow/react'
import { isEmpty } from 'lodash'
import { RefObject } from 'react'
import { useDeleteLabel, useUpdateLabel } from '../../../api/label'
import { showError } from '../../../components/Notification'
import { getContrastColor } from '../../../utils/color-util'
import { LabelEditorNodeData } from './LabelEditorNode'
import { CFormInput, CInputGroup } from '@coreui/react'
import CoreIconButton from '../../../components/CoreIconButton'

export interface LabelEditorControlsProps {
  nodeId: string
  visLevel: string
  onClearSelectedLabel: () => void
  onMarkDirty?: (nodeId: string) => void
  onMarkClean?: (nodeId: string) => void
  originalNodeDataRef: RefObject<Map<string, LabelEditorNodeData>>
}

const LabelEditorControls = ({
  nodeId,
  visLevel,
  onClearSelectedLabel,
  onMarkDirty,
  onMarkClean,
  originalNodeDataRef,
}: LabelEditorControlsProps) => {
  const { mutate: updateLabel } = useUpdateLabel()
  const { mutate: deleteLabel } = useDeleteLabel()

  const nodeData = useNodesData(nodeId)
  const labelData = nodeData?.data as LabelEditorNodeData
  const { updateNodeData, getEdges, getNodes, deleteElements, getNode } = useReactFlow()

  const checkDirty = (updatedFields: Partial<LabelEditorNodeData>) => {
    const original = originalNodeDataRef.current?.get(nodeId)
    if (!original) return
    const current = { ...labelData, ...updatedFields }
    const isDirty =
      (current.name || '') !== (original.name || '') ||
      (current.description || '') !== (original.description || '') ||
      (current.abbreviation || '') !== (original.abbreviation || '') ||
      (current.externalId || '') !== (original.externalId || '') ||
      (current.color || '') !== (original.color || '')
    isDirty ? onMarkDirty?.(nodeId) : onMarkClean?.(nodeId)
  }

  const handleSave = () => {
    const allNodes = getNodes()
    const duplicate = allNodes.some(
      (n) => n.id !== nodeId && (n.data as LabelEditorNodeData).name.trim() === labelData.name.trim(),
    )
    if (duplicate) {
      showError('A label with this name already exists in this tree')
      return
    }
    updateLabel(
      {
        data: {
          id: nodeId,
          name: labelData.name,
          description: labelData.description,
          abbreviation: labelData.abbreviation,
          external_id: labelData.externalId,
          color: labelData.color,
        },
        visLevel,
      },
      {
        onSuccess: () => {
          originalNodeDataRef.current?.set(nodeId, { ...labelData })
          onMarkClean?.(nodeId)
        },
      },
    )
  }

  const handleDelete = () => {
    deleteLabel(nodeId, {
      onSuccess: () => {
        const node = getNode(nodeId)
        if (node) {
          deleteElements({ nodes: [node] })
        }
      },
    })
    onClearSelectedLabel()
  }

  return !isEmpty(nodeId) ? (
    <>
      <b>Edit Label</b>
      <CInputGroup>
        <CFormInput
          className="edit-label-name"
          type="text"
          name="name"
          placeholder="name"
          value={labelData.name}
          onChange={(e) => {
            updateNodeData(nodeId, { name: e.target.value })
            checkDirty({ name: e.target.value })
          }}
        />
        <CFormInput
          className="edit-label-description"
          type="text"
          name="description"
          placeholder="description"
          value={labelData.description || ''}
          onChange={(e) => {
            updateNodeData(nodeId, { description: e.target.value })
            checkDirty({ description: e.target.value })
          }}
        />
        <CFormInput
          type="text"
          name="abbreviation"
          placeholder="abbreviation"
          value={labelData.abbreviation || ''}
          onChange={(e) => {
            updateNodeData(nodeId, { abbreviation: e.target.value })
            checkDirty({ abbreviation: e.target.value })
          }}
        />
        <CFormInput
          type="text"
          name="extID"
          placeholder="external ID"
          value={labelData.externalId || ''}
          onChange={(e) => {
            updateNodeData(nodeId, { externalId: e.target.value })
            checkDirty({ externalId: e.target.value })
          }}
        />
        <CFormInput type="text" value={`ID: ${nodeId}`} disabled />
        <CFormInput
          type="color"
          className="edit-label-color"
          value={labelData.color || '#ffffffff'}
          onChange={(e) => {
            updateNodeData(nodeId, {
              color: e.target.value || '#fff',
              textColor: getContrastColor(e.target.value || '#fff'),
            })
            checkDirty({ color: e.target.value || '#fff' })
          }}
        />
        <CoreIconButton
          className="edit-label-save"
          color="success"
          onClick={handleSave}
          icon={faCheck}
          text="Save"
        />
        <CoreIconButton
          color="danger"
          onClick={handleDelete}
          icon={faTrash}
          text="Delete"
          disabled={getEdges().some((edge) => edge.source === nodeId)}
        />
      </CInputGroup>
    </>
  ) : null
}

export default LabelEditorControls
