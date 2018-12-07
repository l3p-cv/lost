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

const {cleanGroupCreateMessage, getGroups, createGroup} = actions

class CreateGroup extends Component {

    constructor(props) {
        super(props);
        this.state = {
            createGroupName: ''
        }

        this.handleCreateGroupName = this
            .handleCreateGroupName
            .bind(this)
        this.handleCreate = this
            .handleCreate
            .bind(this)

    }

    handleCreateGroupName(e) {
        this.setState({createGroupName: e.target.value})
    }

    handleCreate(e) {
        if (this.validateCreationData()) {
            const payload = {
                group_name: this.state.createGroupName
            }
            this
                .props
                .createGroup(payload)
            this
                .props
                .getGroups()
        } else {
            NotificationManager.error(`No valid data.`)
        }
    }

    validateCreationData() {
        return true
    }
    componentDidUpdate() {
        if (this.props.createMessage === 'success') {
            NotificationManager.success(`Group ${this.state.createGroupName} created.`)
        } else if (this.props.createMessage !== '') {
            NotificationManager.error(this.props.createMessage)
        }
        this
            .props
            .cleanGroupCreateMessage()
    }
    render() {
        return (
            <Row style={{
                padding: '0 0 10px 0'
            }}>
                <Col xs='12' sm='12' lg='12'>
                    <InputGroup>
                        <Input
                            placeholder="group name"
                            value={this.state.createGroupName}
                            onChange={this.handleCreateGroupName}></Input>
                        <InputGroupAddon addonType="append">
                            <Button className='btn-info' onClick={this.handleCreate}>Save</Button>
                        </InputGroupAddon>
                    </InputGroup>
                </Col>
                <NotificationContainer/>
            </Row>
        )
    }
}

function mapStateToProps(state) {
    return ({createMessage: state.group.createMessage})
}

export default connect(mapStateToProps, {cleanGroupCreateMessage, getGroups, createGroup})(CreateGroup)