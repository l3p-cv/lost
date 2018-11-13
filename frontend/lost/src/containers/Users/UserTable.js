import React, {Component} from 'react'
import {connect} from 'react-redux'
import actions from '../../actions'

import ReactTable from 'react-table'
import 'react-table/react-table.css'
import UserGroupDropdown from './UserGroupDropdown'
import UserRolesDropdown from './UserRolesDropdown';

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
                            Cell: row => (
                                <UserGroupDropdown groups={this.props.groups} callback={(g)=>console.log(g)} initGroups={row.original.groups}/>)
                            ,
                            filterable: false,
                        }, {
                            Header: 'Roles',
                            Cell: row => (
                                <UserRolesDropdown roles={this.props.roles} callback={(g)=>console.log(g)} initRoles={row.original.roles}/>)
                            ,
                            filterable: false,
                        }, {
                            Cell: row => (
                            <div>Delete ...</div>
                                )
                            ,
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
        onClick: (e, handleOriginal) => {
            console.log('Cell -  Click', {state, rowInfo, column, event: e})
            if (handleOriginal) {
                handleOriginal()
            }

        },
        onDoubleClick: (e, handleOriginal) => {
            console.log('Cell -  DoubleClick', {state, rowInfo, column, event: e})
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
