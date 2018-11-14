import React, {Component} from 'react'
import {connect} from 'react-redux'

import ReactTable from 'react-table'
import 'react-table/react-table.css'
import UserGroupDropdown from './UserGroupDropdown'
import UserRolesDropdown from './UserRolesDropdown'
import UserContextMenu from './UserContextMenu'
import actions from '../../actions'
import {NotificationManager, NotificationContainer } from 'react-notifications'
import 'react-notifications/lib/notifications.css';

 const {cleanDeleteUserMessage} = actions
class UserTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clickedUser: null
        }
        this.handleRowClick = this
            .handleRowClick
            .bind(this);

    }
    handleRowClick(state, rowInfo, column) {
        return {
            onClick: (e, handleOriginal) => {
                this.setState({clickedUser: rowInfo.original.idx})
                if (handleOriginal) {
                    handleOriginal()
                }

            }
        }
    }
    componentDidUpdate() {
        if (this.props.deleteMessage === 'success') {
            NotificationManager.success(`User with id ${this.state.clickedUser} deleted.`)
        } else if (this.props.deleteMessage !== '') {
            NotificationManager.error(this.props.deleteMessage)
        }
        this
            .props
            .cleanDeleteUserMessage()
    }

    render() {
        const data = this.props.users
        return (
            <React.Fragment>
            <ReactTable
                data={data}
                filterable
                columns={[{
                    Header: 'Users',
                    columns: [
                        {
                            Header: 'Username',
                            accessor: 'user_name',
                            id: 'user_name'
                        }, {
                            Header: 'Email',
                            accessor: 'email'
                        }, {
                            Header: 'Name',
                            accessor: d => `${d.first_name} ${d.last_name}`,
                            id: 'name'
                        }, {
                            Header: 'Groups',
                            Cell: row => (<UserGroupDropdown
                                groups={this.props.groups}
                                callback={(g) => console.log(g)}
                                initGroups={row.original.groups}/>),
                            filterable: false,
                            sortable: false
                        }, {
                            Header: 'Roles',
                            Cell: row => (<UserRolesDropdown
                                roles={this.props.roles}
                                callback={(g) => console.log(g)}
                                initRoles={row.original.roles}/>),
                            filterable: false,
                            sortable: false
                        }, {
                            Cell: row => (
                                 
                                    <UserContextMenu userId={row.original.idx}/>
            
                            ),
                            maxWidth: 35,
                            filterable: false,
                            sortable: false
                        }
                    ]
                }
            ]}
                defaultPageSize={10}
                className='-striped -highlight'
                getTrProps={(state, rowInfo, column) => this.handleRowClick(state, rowInfo, column)}/>
                <NotificationContainer/></React.Fragment>
        )
    }
}

function mapStateToProps(state) {
    return {users: state.user.users, groups: state.group.groups, deleteMessage: state.user.deleteMessage}
}

export default connect(mapStateToProps,{cleanDeleteUserMessage})(UserTable)
