import React, {Component} from 'react'
import {connect} from 'react-redux'
import actions from '../../actions'
import {Col, Row, Input, InputGroup,InputGroupAddon, Button} from 'reactstrap'
import {NotificationManager, NotificationContainer } from 'react-notifications'
import UserGroupDropdown from './UserGroupDropdown'
import UserRolesDropdown from './UserRolesDropdown'

import 'react-notifications/lib/notifications.css';

const {cleanGroupError,createGroup,deleteGroup} = actions

class CreateGroup extends Component {

    constructor(props) {
        super(props);
        this.state = {
            createGroupName: '',
        };
    
        this.handleCreateGroupName = this
            .handleCreateGroupName
            .bind(this);
        this.handleCreate = this
            .handleCreate
            .bind(this);

    }

    handleCreateGroupName(e) {
        this.setState({createGroupName: e.target.value})
    }
   
    handleCreate(e) {
        console.log(this.state)
        if (this.validateCreationData()) {
            const payload = {
                user_name: this.state.createUsername,
                password: this.state.createPassword,
                groups: this.state.createChoosenGroups,
                roles: this.state.createChoosenRoles
            }
            this
                .props
                .createUser(payload)
        } else {
            NotificationManager.error(`No valid data.`)
        }
    }

    validateCreationData(){
        return true
    }
    componentDidUpdate() {
        if (this.props.createError === 'success') {
            NotificationManager.success(`User ${this.state.createUsername} created.`)
        } else if (this.props.createError !== '') {
            NotificationManager.error(this.props.createError)
        }
        this
            .props
            .cleanGroupError()
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
                        <InputGroupAddon addonType="append"><Button className='btn-info' onClick={this.handleCreate}>Create</Button>
                        </InputGroupAddon>
                    </InputGroup>
                </Col>
                <NotificationContainer />
            </Row>
        )
    }
}

function mapStateToProps(state){
    return({createError: state.group.createError})
}

export default connect(mapStateToProps, {cleanGroupError, createGroup, deleteGroup})(CreateGroup)