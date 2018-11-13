import React, {Component} from 'react'
import {connect} from 'react-redux'
import actions from '../../actions'
import {Col, Row, Input, InputGroup,InputGroupAddon, Button} from 'reactstrap'
import {NotificationManager, NotificationContainer } from 'react-notifications'
import UserGroupDropdown from './UserGroupDropdown'
import UserRolesDropdown from './UserRolesDropdown'

import 'react-notifications/lib/notifications.css';

const {cleanError,createUser} = actions

class CreateUser extends Component {

    constructor(props) {
        super(props);
        this.state = {
            createUsername: '',
            createPassword: '',
            createChoosenGroups: [],
            createChoosenRoles: [],
        };
    
        this.handleCreateUsername = this
            .handleCreateUsername
            .bind(this);
        this.handleCreatePassword = this
            .handleCreatePassword
            .bind(this);
        this.handleCreate = this
            .handleCreate
            .bind(this);
        this.createUserCheckGroup = this
            .createUserCheckGroup
            .bind(this);
        this.createUserCheckRole = this
            .createUserCheckRole.bind(this);
    }

    handleCreateUsername(e) {
        this.setState({createUsername: e.target.value})
    }
    handleCreatePassword(e) {
        this.setState({createPassword: e.target.value})
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
            .cleanError()
    }
    createUserCheckGroup(choosenGroups) { 
        this.setState({createChoosenGroups: choosenGroups})
    }

    createUserCheckRole(choosenRoles) { 
        this.setState({createChoosenRoles: choosenRoles})
    }
    render() {
        return (
            <Row style={{
                padding: '0 0 10px 0'
            }}>
                <Col xs='12' sm='12' lg='12'>
                    <InputGroup>
                        <Input
                            placeholder="username"
                            value={this.state.createUsername}
                            onChange={this.handleCreateUsername}></Input>
                        <Input
                            type="password"
                            placeholder="password"
                            value={this.state.createPassword}
                            onChange={this.handleCreatePassword}></Input>
                        <UserGroupDropdown groups={this.props.groups} callback={this.createUserCheckGroup}/>
                        <UserRolesDropdown callback={this.createUserCheckRole}/>
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
    return({createError: state.user.createError})
}

export default connect(mapStateToProps, {cleanError, createUser})(CreateUser)