import React, {Component} from 'react'
import {connect} from 'react-redux'
import actions from '../../actions'
import {
    Col,
    Row,
    Input,
    InputGroup,
    InputGroupAddon,
    Button
} from 'reactstrap'
import {NotificationManager, NotificationContainer} from 'react-notifications'

import 'react-notifications/lib/notifications.css';

const {cleanLabelMessages, createLabelTree} = actions

class CreateLabelTree extends Component {

    constructor(props) {
        super(props);
        this.state = {
            createLabelname: '',
            createLabeldescription: '',
            createLabelabbreviation: '',
            createLabelextID: ''
        }

        this.handleCreateLabelName = this
            .handleCreateLabelName
            .bind(this)
        this.handleCreateLabelDescription = this
            .handleCreateLabelDescription
            .bind(this)
        this.handleCreateSave = this
            .handleCreateSave
            .bind(this)
        this.handleCreateClear = this
            .handleCreateClear
            .bind(this)

    }
    handleCreateClear() {
        this.setState({createLabelname: '', createLabeldescription: '', createLabelabbreviation: '', createLabelextID: ''})
    }
    handleCreateLabelName(e) {
        this.setState({createLabelname: e.target.value})
    }
    handleCreateLabelDescription(e) {
        this.setState({createLabeldescription: e.target.value})
    }

    handleCreateSave(e) {
        const saveData = {
            is_root: true,
            name: this.state.createLabelname,
            description: this.state.createLabeldescription,
            abbreviation: this.state.createLabelabbreviation,
            external_id: this.state.createLabelextID,
            parent_leaf_id: this.state.editLabelid
        }
        this
            .props
            .createLabelTree(saveData)
        this.handleCreateClear()
    }

    componentDidUpdate() {
        if (this.props.createMessage === 'success') {
            NotificationManager.success(`LabelTree created.`)
        } else if (this.props.createMessage !== '') {
            NotificationManager.error(this.props.createMessage)
        }
        this
            .props
            .cleanLabelMessages()
    }
    render() {
        return (
            <Row style={{
                padding: '0 0 10px 0'
            }}>
                <Col xs='12' sm='12' lg='12'>
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
                            <InputGroupAddon addonType="append">
                                <Button className='btn-info' onClick={this.handleCreateSave}>Create</Button>
                                <Button className='btn-danger' onClick={this.handleCreateClear}>&nbsp;Clear&nbsp;</Button>
                            </InputGroupAddon>
                        </InputGroup>
                    </Row>
                </Col>
                <NotificationContainer/>
            </Row>
        )
    }
}

function mapStateToProps(state) {
    return ({createMessage: state.label.createLabelTreeMessage})
}

export default connect(mapStateToProps, {cleanLabelMessages, createLabelTree})(CreateLabelTree)