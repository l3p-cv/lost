import React, {Component} from 'react'
import {connect} from 'react-redux'

import ReactTable from 'react-table'
import 'react-table/react-table.css'
import UserGroupDropdown from './UserGroupDropdown'
import UserRolesDropdown from './UserRolesDropdown'
import UserContextMenu from './ContextMenu'

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
                            Cell: row => (<UserGroupDropdown
                                groups={this.props.groups}
                                callback={(g) => console.log(g)}
                                initGroups={row.original.groups}/>),
                            filterable: false
                        }, {
                            Header: 'Roles',
                            Cell: row => (<UserRolesDropdown
                                roles={this.props.roles}
                                callback={(g) => console.log(g)}
                                initRoles={row.original.roles}/>),
                            filterable: false
                        }, {
                            Cell: row => (
                                
                                    <UserContextMenu/>
            
                            ),
                            filterable: false
                        }
                    ]
                }
            ]}
                defaultPageSize={10}
                className='-striped -highlight'
                getTrProps={(state, rowInfo, column) => this.handleRowClick(state, rowInfo, column)}/>
        )
    }
}

function mapStateToProps(state) {
    return {users: state.user.users, groups: state.group.groups}
}

export default connect(mapStateToProps)(UserTable)
