import React, { Component } from 'react'
import { CTooltip } from '@coreui/react'
import { connect } from 'react-redux'
import actions from '../../actions'
import { Alert, Input, InputGroup, InputGroupAddon } from 'reactstrap'
import IconButton from '../../components/IconButton'
import { NotificationManager, NotificationContainer } from 'react-notifications'
import 'react-notifications/lib/notifications.css'
import { faCheck, faPalette, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { ChromePicker } from 'react-color'

const { updateLabel, deleteLabel, createLabel, cleanLabelMessages } = actions

class EditLabel extends Component {
    constructor(props) {
        super(props)
        this.state = {
            editLabelid: '',
            editLabelname: '',
            editLabeldescription: '',
            editLabelabbreviation: '',
            editLabelextID: '',
            createLabelname: '',
            createLabeldescription: '',
            createLabelabbreviation: '',
            createLabelextID: '',
            selectedCreateColor: '',
            selectedEditColor: '',
            invalidCreateColor: false,
            invalidEditColor: false,
        }
        this.handleEditLabelName = this.handleEditLabelName.bind(this)
        this.handleEditLabelDescription = this.handleEditLabelDescription.bind(this)
        this.handleEditLabelAbbreviation = this.handleEditLabelAbbreviation.bind(this)
        this.handleEditLabelExtID = this.handleEditLabelExtID.bind(this)
        this.handleCreateLabelName = this.handleCreateLabelName.bind(this)
        this.handleCreateLabelDescription = this.handleCreateLabelDescription.bind(this)
        this.handleCreateLabelAbbreviation = this.handleCreateLabelAbbreviation.bind(this)
        this.handleCreateLabelExtID = this.handleCreateLabelExtID.bind(this)
        this.handleEditSave = this.handleEditSave.bind(this)
        this.handleEditDelete = this.handleEditDelete.bind(this)
        this.handleCreateSave = this.handleCreateSave.bind(this)
        this.handleCreateClear = this.handleCreateClear.bind(this)
        this.handleChangeComplete = this.handleChangeComplete.bind(this)
        this.handleCreateLabelColor = this.handleCreateLabelColor.bind(this)
        this.handleEditLabelColor = this.handleEditLabelColor.bind(this)
    }

    componentDidUpdate() {
        if (this.props.updateLabelMessage === 'success') {
            NotificationManager.success(`Label ${this.state.editLabelname} updated.`)
        } else if (this.props.updateLabelMessage !== '') {
            NotificationManager.error(this.props.updateLabelMessage)
        }
        if (this.props.createLabelMessage === 'success') {
            NotificationManager.success(`Label created.`)
        } else if (this.props.createLabelMessage !== '') {
            NotificationManager.error(this.props.createLabelMessage)
        }
        if (this.props.deleteLabelMessage === 'success') {
            NotificationManager.success(`Label ${this.state.editLabelname} deleted.`)
        } else if (this.props.deleteLabelMessage !== '') {
            NotificationManager.error(this.props.deleteLabelMessage)
        }
        this.props.cleanLabelMessages()
    }
    handleEditLabelName(e) {
        this.setState({ editLabelname: e.target.value })
    }
    handleEditLabelDescription(e) {
        this.setState({ editLabeldescription: e.target.value })
    }
    handleEditLabelAbbreviation(e) {
        this.setState({ editLabelabbreviation: e.target.value })
    }
    handleEditLabelExtID(e) {
        this.setState({ editLabelextID: e.target.value })
    }

    handleCreateLabelName(e) {
        this.setState({
            createLabelname: e.target.value,
        })
    }
    handleCreateLabelDescription(e) {
        this.setState({ createLabeldescription: e.target.value })
    }
    handleCreateLabelAbbreviation(e) {
        this.setState({ createLabelabbreviation: e.target.value })
    }
    handleCreateLabelExtID(e) {
        this.setState({ createLabelextID: e.target.value })
    }
    handleCreateLabelColor(e) {
        if (/^#[0-9A-F]{6}$/i.test(e.target.value) || e.target.value === '') {
            this.setState({ invalidCreateColor: false })
        } else {
            this.setState({ invalidCreateColor: true })
        }
        this.setState({ selectedCreateColor: e.target.value })
    }

    handleEditLabelColor(e) {
        if (/^#[0-9A-F]{6}$/i.test(e.target.value) || e.target.value === '') {
            this.setState({ invalidEditColor: false })
        } else {
            this.setState({ invalidEditColor: true })
        }
        this.setState({ selectedEditColor: e.target.value })
    }
    componentWillReceiveProps(props) {
        if (props.label) {
            const { idx, name, description, abbreviation, external_id, color } =
                props.label
            this.setState({
                editLabelid: idx,
                editLabelname: name ? name : '',
                editLabeldescription: description ? description : '',
                editLabelabbreviation: abbreviation ? abbreviation : '',
                editLabelextID: external_id ? external_id : '',
                selectedEditColor: color ? color : '',
            })
        }
    }

    handleEditSave() {
        const updateData = {
            id: this.state.editLabelid,
            name: this.state.editLabelname,
            description: this.state.editLabeldescription,
            abbreviation: this.state.editLabelabbreviation,
            external_id: this.state.editLabelextID,
            color: this.state.selectedEditColor,
        }
        this.props.updateLabel(updateData, this.props.visLevel)
    }
    handleEditDelete() {
        this.props.deleteLabel({ id: this.state.editLabelid }, this.props.visLevel)
        this.props.clearSelectedLabel()
    }
    handleCreateSave() {
        const saveData = {
            is_root: false,
            name: this.state.createLabelname,
            description: this.state.createLabeldescription,
            abbreviation: this.state.createLabelabbreviation,
            external_id: this.state.createLabelextID,
            parent_leaf_id: this.state.editLabelid,
            color: this.state.selectedCreateColor,
        }
        this.props.createLabel(saveData, this.props.visLevel)
        this.handleCreateClear()
    }
    handleCreateClear() {
        this.setState({
            createLabelname: '',
            createLabeldescription: '',
            createLabelabbreviation: '',
            createLabelextID: '',
            selectedCreateColor: '',
        })
    }
    handleChangeComplete(color, event) {
        this.setState({
            ...this.state,
            selectedColor: color,
        })
    }
    renderColorPicker() {
        return (
            <ChromePicker
                color={this.state.selectedColor}
                onChange={this.handleChangeComplete}
            ></ChromePicker>
        )
    }
    render() {
        if (this.props.label) {
            return (
                <>
                    <b>
                        <div style={{ marginBottom: 10 }}>Edit Parent</div>
                    </b>
                    <InputGroup>
                        <Input
                            type="text"
                            placeholder="name"
                            value={this.state.editLabelname}
                            onChange={this.handleEditLabelName}
                        ></Input>
                        <Input
                            type="text"
                            placeholder="description"
                            value={this.state.editLabeldescription}
                            onChange={this.handleEditLabelDescription}
                        ></Input>
                        <Input
                            type="text"
                            placeholder="abbreviation"
                            value={this.state.editLabelabbreviation}
                            onChange={this.handleEditLabelAbbreviation}
                        ></Input>
                        <Input
                            type="text"
                            placeholder="external ID"
                            value={this.state.editLabelextID}
                            onChange={this.handleEditLabelExtID}
                        ></Input>
                        <Input
                            type="text"
                            placeholder="color"
                            value={this.state.selectedEditColor}
                            onChange={this.handleEditLabelColor}
                            invalid={this.state.invalidEditColor}
                        ></Input>
                        <InputGroupAddon addonType="append">
                            <IconButton
                                color="danger"
                                onClick={this.handleEditDelete}
                                icon={faTrash}
                                isOutline={false}
                                disabled={this.props.label.children.length > 0}
                            />
                            <IconButton
                                color="primary"
                                isOutline={false}
                                icon={faCheck}
                                onClick={this.handleEditSave}
                                text="Save"
                            />
                        </InputGroupAddon>
                    </InputGroup>
                    <hr></hr>
                    <b>
                        <div style={{ marginBottom: 10 }}>Add Child</div>
                    </b>
                    <InputGroup>
                        <Input
                            type="text"
                            placeholder="name"
                            value={this.state.createLabelname}
                            onChange={this.handleCreateLabelName}
                        ></Input>
                        <Input
                            type="text"
                            placeholder="description"
                            value={this.state.createLabeldescription}
                            onChange={this.handleCreateLabelDescription}
                        ></Input>
                        <Input
                            type="text"
                            placeholder="abbreviation"
                            value={this.state.createLabelabbreviation}
                            onChange={this.handleCreateLabelAbbreviation}
                        ></Input>
                        <Input
                            type="text"
                            placeholder="external ID"
                            value={this.state.createLabelextID}
                            onChange={this.handleCreateLabelExtID}
                        ></Input>
                        <Input
                            type="text"
                            placeholder="color"
                            value={this.state.selectedCreateColor}
                            onChange={this.handleCreateLabelColor}
                            invalid={this.state.invalidCreateColor}
                        ></Input>
                        <InputGroupAddon addonType="append">
                            <IconButton
                                color="primary"
                                onClick={this.handleCreateSave}
                                text="Add"
                                icon={faPlus}
                                isOutline={false}
                                disabled={this.state.invalidCreateColor}
                            />
                        </InputGroupAddon>
                    </InputGroup>
                    <NotificationContainer />
                </>
            )
        } else {
            return (
                <Alert className="alert-info">
                    Click on a label to edit it or create a new label to add at this
                    point.
                </Alert>
            )
        }
    }
}

function mapStateToProps(state) {
    return {
        updateLabelMessage: state.label.updateLabelMessage,
        createLabelMessage: state.label.createLabelMessage,
        deleteLabelMessage: state.label.deleteLabelMessage,
    }
}
export default connect(mapStateToProps, {
    updateLabel,
    createLabel,
    deleteLabel,
    cleanLabelMessages,
})(EditLabel)
