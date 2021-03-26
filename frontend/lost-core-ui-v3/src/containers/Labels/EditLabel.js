import React, {Component} from 'react'
import {connect} from 'react-redux'
import actions from '../../actions'
import {
    Alert,
    Card,
    CardBody,
    CardHeader,
    Col,
    Row,
    Input,
    InputGroup,
    InputGroupAddon,
    Button
} from 'reactstrap'
import {NotificationManager, NotificationContainer} from 'react-notifications'
import 'react-notifications/lib/notifications.css';

const {updateLabel, deleteLabel, createLabel, cleanLabelMessages} = actions

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
            createLabelextID: ''
        }
        this.handleEditLabelName = this
            .handleEditLabelName
            .bind(this);
        this.handleEditLabelDescription = this
            .handleEditLabelDescription
            .bind(this);
        this.handleEditLabelAbbreviation = this
            .handleEditLabelAbbreviation
            .bind(this);
        this.handleEditLabelExtID = this
            .handleEditLabelExtID
            .bind(this);
        this.handleCreateLabelName = this
            .handleCreateLabelName
            .bind(this);
        this.handleCreateLabelDescription = this
            .handleCreateLabelDescription
            .bind(this);
        this.handleCreateLabelAbbreviation = this
            .handleCreateLabelAbbreviation
            .bind(this);
        this.handleCreateLabelExtID = this
            .handleCreateLabelExtID
            .bind(this);
        this.handleEditSave = this
            .handleEditSave
            .bind(this);
        this.handleEditDelete = this
            .handleEditDelete
            .bind(this);
        this.handleCreateSave = this
            .handleCreateSave
            .bind(this);
        this.handleCreateClear = this
            .handleCreateClear
            .bind(this);
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
        this
            .props
            .cleanLabelMessages()
    }
    handleEditLabelName(e) {
        this.setState({editLabelname: e.target.value})
    }
    handleEditLabelDescription(e) {
        this.setState({editLabeldescription: e.target.value})
    }
    handleEditLabelAbbreviation(e) {
        this.setState({editLabelabbreviation: e.target.value})
    }
    handleEditLabelExtID(e) {
        this.setState({editLabelextID: e.target.value})
    }

    handleCreateLabelName(e) {
        this.setState({
            createLabelname: e.target.value
        })
    }
    handleCreateLabelDescription(e) {
        this.setState({createLabeldescription: e.target.value})
    }
    handleCreateLabelAbbreviation(e) {
        this.setState({createLabelabbreviation: e.target.value})
    }
    handleCreateLabelExtID(e) {
        this.setState({createLabelextID: e.target.value})
    }
    componentWillReceiveProps(props) {
        if (props.label) {
            const {idx, name, description, abbreviation, external_id} = props.label
            this.setState({
                editLabelid: idx,
                editLabelname: name
                    ? name
                    : '',
                editLabeldescription: description
                    ? description
                    : '',
                editLabelabbreviation: abbreviation
                    ? abbreviation
                    : '',
                editLabelextID: external_id
                    ? external_id
                    : ''
            })
        }
    }

    handleEditSave() {
        const updateData = {
            id: this.state.editLabelid,
            name: this.state.editLabelname,
            description: this.state.editLabeldescription,
            abbreviation: this.state.editLabelabbreviation,
            external_id: this.state.editLabelextID
        }
        this
            .props
            .updateLabel(updateData)
    }
    handleEditDelete() {
        this
            .props
            .deleteLabel({id: this.state.editLabelid})
        this
            .props
            .clearSelectedLabel()

    }
    handleCreateSave() {
        const saveData = {
            is_root: false,
            name: this.state.createLabelname,
            description: this.state.createLabeldescription,
            abbreviation: this.state.createLabelabbreviation,
            external_id: this.state.createLabelextID,
            parent_leaf_id: this.state.editLabelid
        }
        this
            .props
            .createLabel(saveData)
        this.handleCreateClear()
    }
    handleCreateClear() {
        this.setState({createLabelname: '', createLabeldescription: '', createLabelabbreviation: '', createLabelextID: ''})
    }
    render() {
        if (this.props.label) {
            return (
                <React.Fragment>
                    <Row
                        style={{
                        padding: '0 0 10px 0'
                    }}>
                        <Col xs='12' sm='12' lg='12'>
                            <Card>
                                <CardHeader>
                                    Edit and Add Label
                                </CardHeader>
                                <CardBody>
                                    <Row>
                                        Edit
                                    </Row>
                                    <Row
                                        style={{
                                        padding: '0px 0px 10px 0px'
                                    }}>
                                        <InputGroup>
                                            <Input
                                                type="text"
                                                placeholder="name"
                                                value={this.state.editLabelname}
                                                onChange={this.handleEditLabelName}></Input>
                                            <Input
                                                type="text"
                                                placeholder="description"
                                                value={this.state.editLabeldescription}
                                                onChange={this.handleEditLabelDescription}></Input>
                                            <Input
                                                type="text"
                                                placeholder="abbreviation"
                                                value={this.state.editLabelabbreviation}
                                                onChange={this.handleEditLabelAbbreviation}></Input>
                                            <Input
                                                type="text"
                                                placeholder="external ID"
                                                value={this.state.editLabelextID}
                                                onChange={this.handleEditLabelExtID}></Input>
                                            <InputGroupAddon addonType="append">
                                                <Button className='btn-info' onClick={this.handleEditSave}>Save</Button>
                                                <Button className='btn-danger' onClick={this.handleEditDelete}>Delete</Button>
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </Row>
                                    <Row>Add Child</Row>
                                    <Row>
                                        <InputGroup>
                                            <Input
                                                type="text"
                                                placeholder="name"
                                                value={this.state.createLabelname}
                                                onChange={this.handleCreateLabelName}></Input>
                                            <Input
                                                type="text"
                                                placeholder="description"
                                                value={this.state.createLabeldescription}
                                                onChange={this.handleCreateLabelDescription}></Input>
                                            <Input
                                                type="text"
                                                placeholder="abbreviation"
                                                value={this.state.createLabelabbreviation}
                                                onChange={this.handleCreateLabelAbbreviation}></Input>
                                            <Input
                                                type="text"
                                                placeholder="external ID"
                                                value={this.state.createLabelextID}
                                                onChange={this.handleCreateLabelExtID}></Input>
                                            <InputGroupAddon addonType="append">
                                                <Button className='btn-info' onClick={this.handleCreateSave}>Save</Button>
                                                <Button className='btn-danger' onClick={this.handleCreateClear}>&nbsp;Clear&nbsp;</Button>
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </Row>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    <NotificationContainer/>
                </React.Fragment>
            )
        } else {
            return (
                <Alert className='alert-info'>Click on a label to edit it or create a new label to add at this point.
                </Alert>
            )
        }
    }
}

function mapStateToProps(state) {
    return ({updateLabelMessage: state.label.updateLabelMessage, createLabelMessage: state.label.createLabelMessage, deleteLabelMessage: state.label.deleteLabelMessage})
}
export default connect(mapStateToProps, {updateLabel, createLabel, deleteLabel, cleanLabelMessages})(EditLabel)