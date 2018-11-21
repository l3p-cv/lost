import React, {Component} from 'react'
import {connect} from 'react-redux'

import {Input} from 'reactstrap'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import UserGroupDropdown from './UserGroupDropdown'
import UserRolesDropdown from './UserRolesDropdown'
import UserContextMenu from './UserContextMenu'
import actions from '../../actions'
import {NotificationManager, NotificationContainer} from 'react-notifications'
import 'react-notifications/lib/notifications.css';

const {cleanDeleteUserMessage, cleanUpdateUserMessage, updateUser} = actions
class UserTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editingUser: {
                idx: null,
                email: null,
                first_name: null,
                last_name: null,
                password: null,
                groups: [],
                roles: []
            }
        }
        this.renderEditable = this
            .renderEditable
            .bind(this);
        this.updateUserRoles = this
            .updateUserRoles
            .bind(this);
        this.updateUserGroups = this
            .updateUserGroups
            .bind(this);
        this.updateUserCells = this
            .updateUserCells
            .bind(this);
        this.updateUserBackend = this
            .updateUserBackend
            .bind(this);
        this.updatePassword = this
            .updatePassword
            .bind(this);

    }
    updateUserBackend(updateUser) {
        if (updateUser.idx !== null) {
            this
                .props
                .updateUser(updateUser)
        }
    }

    componentDidUpdate() {
        if (this.props.deleteMessage === 'success') {
            NotificationManager.success(`User successfully deleted.`)
        } else if (this.props.deleteMessage !== '') {
            NotificationManager.error(this.props.deleteMessage)
        }
        this
            .props
            .cleanDeleteUserMessage()

        if (this.props.updateMessage === 'success') {
            NotificationManager.success(`User successfully updated.`)
        } else if (this.props.updateMessage !== '') {
            NotificationManager.error(this.props.updateMessage)
        }
        this
            .props
            .cleanUpdateUserMessage()
    }
    updatePassword(rowInfo, password) {
        const {idx, email, first_name, last_name} = rowInfo.original
        const roles = rowInfo
            .original
            .roles
            .map((r) => r.name)
        const groups = rowInfo
            .original
            .groups
            .map((g) => g.name)
        let updateUser = {
            idx,
            email,
            first_name,
            last_name,
            groups,
            roles,
            password: password
        }
        this.updateUserBackend(updateUser)
    }
    updateUserGroups(rowInfo, g) {
        const {idx, email, first_name, last_name} = rowInfo.original
        const roles = rowInfo
            .original
            .roles
            .map((r) => r.name)
        const updateUser = {
            idx,
            email,
            first_name,
            last_name,
            roles,
            groups: g,
            password: null
        }
        this.updateUserBackend(updateUser)
    }
    updateUserRoles(rowInfo, r) {
        const {idx, email, first_name, last_name} = rowInfo.original
        const groups = rowInfo
            .original
            .groups
            .map((g) => g.name)
        const updateUser = {
            idx,
            email,
            first_name,
            last_name,
            groups,
            roles: r,
            password: null
        }
        this.updateUserBackend(updateUser)
    }
    updateUserCells(e, cellInfo) {
        const {idx, email, first_name, last_name} = cellInfo.original
        const roles = cellInfo
            .original
            .roles
            .map((r) => r.name)
        const groups = cellInfo
            .original
            .groups
            .map((g) => g.name)
        let updateUser = {
            idx,
            email,
            first_name,
            last_name,
            groups,
            roles,
            password: null
        }
        switch (cellInfo.column.id) {
            case 'first_name':
                {
                    updateUser = {
                        ...updateUser,
                        first_name: e
                    }
                    break
                }
            case 'email':
                {
                    updateUser = {
                        ...updateUser,
                        email: e
                    }
                    break
                }
            case 'last_name':
                {
                    updateUser = {
                        ...updateUser,
                        last_name: e
                    }
                    break
                }
            case 'password':
                {
                    updateUser = {
                        ...updateUser,
                        password: e
                    }
                    break
                }

            default:
                {}
        }
        this.updateUserBackend(updateUser)
    }

    renderEditable(cellInfo) {
        if (cellInfo.column.id === 'password') {
            return (<Input
                placeholder='&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;'
                type='password'
                onBlur={(event) => this.updatePassword(cellInfo, event.target.value)}/>)
        }
        return (<div
            style={{
            backgroundColor: "#fafafa"
        }}
            contentEditable
            suppressContentEditableWarning
            onBlur={e => {
            this.updateUserCells(e.target.innerHTML, cellInfo)
        }}
            dangerouslySetInnerHTML={{
            __html: this.props.users[cellInfo.index][cellInfo.column.id]
        }}/>);
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
                                accessor: 'user_name'
                            }, {
                                Header: 'Email',
                                accessor: 'email',
                                Cell: this.renderEditable
                            }, {
                                Header: 'First Name',
                                accessor: 'first_name',
                                Cell: this.renderEditable
                            }, {
                                Header: 'Last Name',
                                accessor: 'last_name',
                                Cell: this.renderEditable
                            }, {
                                Header: 'Password',
                                id: 'password',
                                Cell: this.renderEditable,
                                filterable: false,
                                sortable: false
                            }, {
                                Header: 'Groups',
                                Cell: row => (<UserGroupDropdown
                                    groups={this.props.groups}
                                    rowInfo={row}
                                    callback={(rowInfo, g) => this.updateUserGroups(rowInfo, g)}
                                    initGroups={row.original.groups}/>),
                                filterable: false,
                                sortable: false
                            }, {
                                Header: 'Roles',
                                Cell: row => (<UserRolesDropdown
                                    roles={this.props.roles}
                                    rowInfo={row}
                                    callback={(rowInfo, g) => this.updateUserRoles(rowInfo, g)}
                                    initRoles={row.original.roles}/>),
                                filterable: false,
                                sortable: false
                            }, {
                                Cell: row => (<UserContextMenu userId={row.original.idx}/>),
                                maxWidth: 35,
                                filterable: false,
                                sortable: false
                            }
                        ]
                    }
                ]}
                    defaultPageSize={10}
                    className='-striped -highlight'/>
                <NotificationContainer/>
            </React.Fragment>
        )
    }
}

function mapStateToProps(state) {
    return {users: state.user.users, groups: state.group.groups, deleteMessage: state.user.deleteMessage, updateMessage: state.user.updateMessage}
}

export default connect(mapStateToProps, {cleanDeleteUserMessage, updateUser, cleanUpdateUserMessage})(UserTable)
