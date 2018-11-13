import React, {Component} from 'react'
import {connect} from 'react-redux'
import {
    Card,
    CardBody,
    Col,
    Row
} from 'reactstrap'

import CreateUser from '../../containers/Users/CreateUser'
import UserTable from '../../containers/Users/UserTable'
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
                <Col xs='12' sm='12' lg='12'>
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