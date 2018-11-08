import React, {Component} from 'react'
import {connect} from 'react-redux'
import actions from '../actions'
import {
    Alert,
    Badge,
    Card,
    CardBody,
    Col,
    Row
} from 'reactstrap'

// Import React Table
import ReactTable from 'react-table'
import 'react-table/react-table.css'

const {getUsers} = actions

const treeColumns = [
    {
        Header: 'Users',
        columns: [
            {
                Header: 'Name',
                accessor: d => `${d.first_name} ${d.last_name}`,
                id: 'user_name'
            }, 
            {
                Header: 'User name',
                accessor: 'user_name',
                id: 'name'
            }, {
                Header: 'Email',
                accessor: 'email'
            }, {
                Header: 'Groups',
                accessor:  d => d.groups.map((group) => `,${group.name}`).join(' '),
                id: 'idx'
            }, {
                Header: 'Controls',
                sortable: false,
                filterable: false,
            }
        ]
    }
]


class User extends Component {
 
    componentDidMount() {
        this.props.getUsers()
    }
    render() {
        const data = this.props.users
        console.log(data)
        return (
            <div>
                <Row>
                    <Col xs='12' sm='12' lg='12'>
                        <Card className='text-black'>
                            <CardBody className='pb-0'>
                                <ReactTable
                                    data={data}
                                    columns={treeColumns}
                                    defaultPageSize={10}
                                    className='-striped -highlight'
                                    getTrProps={(state, rowInfo, column) => getProps(state, rowInfo, column)}
                                   />
                                <br/>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }
}

function getProps(state, rowInfo, column) {
    return {
        onDoubleClick: (e, handleOriginal) => {
            //alert('Clicked on ' + rowInfo.row.id)
            console.log('Cell - Double Click', {state, rowInfo, column, event: e})
            if (handleOriginal) {
                handleOriginal()
            }

        }
    }
}

function mapStateToProps(state) {
    return {users: state.user.users}
}

export default connect(mapStateToProps, {getUsers})(User)
