import { faCheck, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useNodesData, useReactFlow } from '@xyflow/react'
import { isEmpty } from 'lodash'
import { Input, InputGroup } from 'reactstrap'
import { useDeleteLabel, useUpdateLabel } from '../../../actions/label/label-api'
import IconButton from '../../../components/IconButton'
import { getContrastColor } from '../../../utils/color-util'
import { LabelEditorNodeData } from './LabelEditorNode'

export interface LabelEditorControlsProps {
    nodeId: string
    visLevel: string
    onClearSelectedLabel: () => void
}

const LabelEditorControls = ({
    nodeId,
    visLevel,
    onClearSelectedLabel,
}: LabelEditorControlsProps) => {
    const { mutate: updateLabel } = useUpdateLabel()
    const { mutate: deleteLabel } = useDeleteLabel()

    const nodeData = useNodesData(nodeId)
    const labelData = nodeData?.data as LabelEditorNodeData
    const { updateNodeData, getEdges, deleteElements, getNode } = useReactFlow()

    const handleSave = () =>
        updateLabel({
            data: {
                id: nodeId,
                name: labelData.name,
                description: labelData.description,
                abbreviation: labelData.abbreviation,
                external_id: labelData.externalId,
                color: labelData.color,
            },
            visLevel,
        })

    const handleDelete = () => {
        deleteLabel(nodeId, {
            onSuccess: () => {
                const node = getNode(nodeId)
                if (node) {
                    deleteElements({
                        nodes: [node],
                    })
                }
            },
        })
        onClearSelectedLabel()
    }

    return !isEmpty(nodeId) ? (
        <>
            <b>Edit Label</b>
            <InputGroup>
                <Input
                    className="edit-label-name"
                    type="text"
                    name="name"
                    placeholder="name"
                    value={labelData.name}
                    onChange={(e) => {
                        updateNodeData(nodeId, { name: e.target.value })
                    }}
                />
                <Input
                    className="edit-label-description"
                    type="text"
                    name="description"
                    placeholder="description"
                    value={labelData.description || ''}
                    onChange={(e) => {
                        updateNodeData(nodeId, { description: e.target.value })
                    }}
                />
                <Input
                    type="text"
                    name="abbreviation"
                    placeholder="abbreviation"
                    value={labelData.abbreviation || ''}
                    onChange={(e) => {
                        updateNodeData(nodeId, { abbreviation: e.target.value })
                    }}
                />
                <Input
                    type="text"
                    name="extID"
                    placeholder="external ID"
                    value={labelData.externalId || ''}
                    onChange={(e) => {
                        updateNodeData(nodeId, { externalId: e.target.value })
                    }}
                />
                <Input
                    type="color"
                    className="edit-label-color"
                    value={labelData.color || '#ffffff'}
                    onChange={(e) => {
                        updateNodeData(nodeId, {
                            color: e.target.value || '#fff',
                            textColor: getContrastColor(e.target.value || '#fff'),
                        })
                    }}
                />
                <IconButton
                    color="danger"
                    onClick={handleDelete}
                    icon={faTrash}
                    disabled={getEdges().some((edge) => edge.source === nodeId)}
                />
                <IconButton
                    className="edit-label-save"
                    color="primary"
                    onClick={handleSave}
                    icon={faCheck}
                    text="Save"
                />
            </InputGroup>
        </>
    ) : (
        <></>
    )
}

export default LabelEditorControls
