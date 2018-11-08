import React, {Component} from 'react'
import {connect} from 'react-redux'
import actions from '../actions'
import {
    Card,
    CardBody,
    Col,
    Row
} from 'reactstrap'

// Import React Table
import ReactTable from 'react-table'
import 'react-table/react-table.css'

const {getGroups} = actions

const treeColumns = [
    {
        Header: 'Groups',
        columns: [
            {
                Header: 'Name',
                accessor: 'name',
                id: 'name'
            },{
                Header: 'Controls',
                sortable: false,
                filterable: false
            }
        ]
    }
]


class Group extends Component {
 
    componentDidMount() {
        this.props.getGroups()
    }
    render() {
        const data = this.props.groups
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
                                    filterable
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
    return {groups: state.group.groups}
}

export default connect(mapStateToProps, {getGroups})(Group)
