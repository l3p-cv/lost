import React, {Component} from 'react'
import {connect} from 'react-redux'
import actions from '../../actions'

import ReactTable from 'react-table'
import 'react-table/react-table.css'
import UserGroupDropdown from './UserGroupDropdown'

const {getUsers, getGroups} = actions

class UserTable extends Component {

   

    render() {
        const data = this.props.users
        return (
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
                            accessor: d => d
                                .groups
                                .map((group) => `${group.name},`)
                                .join(' ')
                                .slice(0, -1),
                            id: 'idx',
                            filterable: false,
                        }, {
                            Header: 'Roles',
                            accessor: d => d
                                .roles
                                .map((role) => `${role.name},`)
                                .join(' ')
                                .slice(0, -1),
                            id: 'roles',
                            filterable: false,
                        }, {
                            Cell: row => (
                                <UserGroupDropdown groups={this.props.groups}/>
                            ),
                            filterable: false,
                        }
                    ]
                }
            ]}
                defaultPageSize={10}
                className='-striped -highlight'
                getTrProps={(state, rowInfo, column) => getProps(state, rowInfo, column)}/>
        )
    }
}

function getProps(state, rowInfo, column) {
    return {
        onDoubleClick: (e, handleOriginal) => {
            console.log('Cell - Double Click', {state, rowInfo, column, event: e})
            if (handleOriginal) {
                handleOriginal()
            }

        }
    }
}

function mapStateToProps(state) {
    return {users: state.user.users, groups: state.group.groups}
}

export default connect(mapStateToProps, {getUsers, getGroups})(UserTable)
