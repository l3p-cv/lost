import { faCheck, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import { NotificationContainer, NotificationManager } from 'react-notifications'
import 'react-notifications/lib/notifications.css'
import { connect } from 'react-redux'
import { Alert, Input, InputGroup } from 'reactstrap'
import actions from '../../actions'
import IconButton from '../../components/IconButton'

const { updateLabel, deleteLabel, createLabel, cleanLabelMessages } = actions

const EditLabel = ({
    label,
    visLevel,
    updateLabel,
    deleteLabel,
    createLabel,
    cleanLabelMessages,
    updateLabelMessage,
    createLabelMessage,
    deleteLabelMessage,
    clearSelectedLabel,
}) => {
    const [editLabel, setEditLabel] = useState({
        id: '',
        name: '',
        description: '',
        abbreviation: '',
        extID: '',
        color: '',
    })
    const [createLabelData, setCreateLabelData] = useState({
        name: '',
        description: '',
        abbreviation: '',
        extID: '',
        color: '#ffffff',
    })
    const [invalidCreateColor, setInvalidCreateColor] = useState(false)
    const [invalidEditColor, setInvalidEditColor] = useState(false)

    useEffect(() => {
        if (updateLabelMessage === 'success') {
            NotificationManager.success(`Label ${editLabel.name} updated.`)
        } else if (updateLabelMessage) {
            NotificationManager.error(updateLabelMessage)
        }
        if (createLabelMessage === 'success') {
            NotificationManager.success('Label created.')
        } else if (createLabelMessage) {
            NotificationManager.error(createLabelMessage)
        }
        if (deleteLabelMessage === 'success') {
            NotificationManager.success(`Label ${editLabel.name} deleted.`)
        } else if (deleteLabelMessage) {
            NotificationManager.error(deleteLabelMessage)
        }
        cleanLabelMessages()
    }, [
        updateLabelMessage,
        createLabelMessage,
        deleteLabelMessage,
        editLabel.name,
        cleanLabelMessages,
    ])

    useEffect(() => {
        if (label) {
            setEditLabel({
                id: label.idx || '',
                name: label.name || '',
                description: label.description || '',
                abbreviation: label.abbreviation || '',
                extID: label.external_id || '',
                color: label.color || '',
            })
        }
    }, [label])

    const handleInputChange = (setter) => (e) =>
        setter((prev) => ({ ...prev, [e.target.name]: e.target.value }))

    const handleColorChange = (setter, setInvalid) => (e) => {
        const color = e.target.value
        if (/^#[0-9A-F]{6}$/i.test(color) || color === '') {
            setInvalid(false)
        } else {
            setInvalid(true)
        }
        setter((prev) => ({ ...prev, color }))
    }

    const handleEditSave = () => updateLabel({ ...editLabel }, visLevel)
    const handleEditDelete = () => {
        deleteLabel({ id: editLabel.id }, visLevel)
        clearSelectedLabel()
    }
    const handleCreateSave = () => {
        createLabel(
            { ...createLabelData, is_root: false, parent_leaf_id: editLabel.id },
            visLevel,
        )
        setCreateLabelData({
            name: '',
            description: '',
            abbreviation: '',
            extID: '',
            color: '#ffffff',
        })
    }

    return label ? (
        <>
            <b>Edit Parent</b>
            <InputGroup>
                <Input
                    type="text"
                    name="name"
                    placeholder="name"
                    value={editLabel.name}
                    onChange={handleInputChange(setEditLabel)}
                />
                <Input
                    type="text"
                    name="description"
                    placeholder="description"
                    value={editLabel.description}
                    onChange={handleInputChange(setEditLabel)}
                />
                <Input
                    type="text"
                    name="abbreviation"
                    placeholder="abbreviation"
                    value={editLabel.abbreviation}
                    onChange={handleInputChange(setEditLabel)}
                />
                <Input
                    type="text"
                    name="extID"
                    placeholder="external ID"
                    value={editLabel.extID}
                    onChange={handleInputChange(setEditLabel)}
                />
                <Input
                    type="color"
                    value={editLabel.color}
                    onChange={handleColorChange(setEditLabel, setInvalidEditColor)}
                    invalid={invalidEditColor}
                />
                <IconButton
                    color="danger"
                    onClick={handleEditDelete}
                    icon={faTrash}
                    disabled={label.children.length > 0}
                />
                <IconButton
                    color="primary"
                    onClick={handleEditSave}
                    icon={faCheck}
                    text="Save"
                />
            </InputGroup>
            <hr />
            <b>Add Child</b>
            <InputGroup>
                <Input
                    type="text"
                    name="name"
                    placeholder="name"
                    value={createLabelData.name}
                    onChange={handleInputChange(setCreateLabelData)}
                />
                <Input
                    type="text"
                    name="description"
                    placeholder="description"
                    value={createLabelData.description}
                    onChange={handleInputChange(setCreateLabelData)}
                />
                <Input
                    type="text"
                    name="abbreviation"
                    placeholder="abbreviation"
                    value={createLabelData.abbreviation}
                    onChange={handleInputChange(setCreateLabelData)}
                />
                <Input
                    type="text"
                    name="extID"
                    placeholder="external ID"
                    value={createLabelData.extID}
                    onChange={handleInputChange(setCreateLabelData)}
                />
                <Input
                    type="color"
                    value={createLabelData.color}
                    onChange={handleColorChange(
                        setCreateLabelData,
                        setInvalidCreateColor,
                    )}
                    invalid={invalidCreateColor}
                />
                <IconButton
                    color="primary"
                    onClick={handleCreateSave}
                    icon={faPlus}
                    text="Add"
                    disabled={invalidCreateColor}
                />
            </InputGroup>
            <NotificationContainer />
        </>
    ) : (
        <Alert className="alert-info">
            Click on a label to edit it or create a new label to add at this point.
        </Alert>
    )
}

const mapStateToProps = (state) => ({
    updateLabelMessage: state.label.updateLabelMessage,
    createLabelMessage: state.label.createLabelMessage,
    deleteLabelMessage: state.label.deleteLabelMessage,
})

export default connect(mapStateToProps, {
    updateLabel,
    createLabel,
    deleteLabel,
    cleanLabelMessages,
})(EditLabel)
