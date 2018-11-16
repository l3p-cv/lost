import React, {Component} from 'react'
import {connect} from 'react-redux'
import {
    Card,
    CardBody,
    Col,
    Row
} from 'reactstrap'

import CreateUser from '../../containers/Users/CreateUser'
import CreateGroup from '../../containers/Users/CreateGroup'
import UserTable from '../../containers/Users/UserTable'
import GroupList from '../../containers/Users/GroupList'
import actions from '../../actions'

const {getGroups, getUsers} = actions

class User extends Component {
    componentDidMount() {
        this
            .props
            .getUsers()
        this
            .props
            .getGroups()
    }

    render() {
        return (
            <Row>
                <Col xs='4' sm='4' lg='3'>
                    <Card className='text-black'>
                        <CardBody className='pb-0'>
                        <CreateGroup groups={this.props.groups}></CreateGroup>
                        <GroupList></GroupList>
                        </CardBody>
                    </Card>
                </Col>
                <Col xs='8' sm='8' lg='9'>
                    <Card className='text-black'>
                        <CardBody className='pb-0'>
                        <CreateUser groups={this.props.groups}></CreateUser>
                        <div></div>
                        <UserTable users={this.props.users} groups={this.props.groups}></UserTable>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

        )
    }
}
function mapStateToProps(state){
    return({users: state.user.users, groups: state.group.groups})
}

export default connect(mapStateToProps, {getUsers, getGroups})(User)