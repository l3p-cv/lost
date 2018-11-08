import React, {Component} from 'react'
import {connect} from 'react-redux'
import * as actions from '../actions'

import {makeData, Tips} from './Utils'
import {
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    CardTitle,
    Col,
    Row,
    InputGroup,
    Input
} from 'reactstrap'

// Import React Table
import ReactTable from 'react-table'
import 'react-table/react-table.css'

const treeColumns = [
    {
        Header: 'Trees',
        columns: [
            {
                Header: 'Name',
                accessor: 'name',
                id: 'name'
            }, {
                Header: 'Description',
                accessor: 'description'
            },{
                Header: 'Group',
                accessor: 'group'
            },{
                Header: 'Controls'
            }
        ]
    }
]
const labelColumns = [
    {
        Header: 'Labels',
        columns: [
            {
                Header: 'Name',
                accessor: 'name'
            },
            {
                Header: 'Description',
                accessor: 'description'
            },
            {
                Header: 'Leaf ID',
                accessor: 'leafId'
            }
        ]
    }
]

class Label extends Component {
    constructor() {
        super()
        this.state = {
            data: makeData()
        }
        console.log(this.state)
    }
    render() {
        const {data} = this.state
        return (
            <div>
                <Row>
                    <Col xs='12' sm='12' lg='12'>
                        <Card className='text-black bg-light'>
                            <CardBody className='pb-0'>
                                <ReactTable
                                    data={data}
                                    columns={treeColumns}
                                    defaultPageSize={10}
                                    filterable
                                    className='-striped -highlight'
                                    getTrProps={(state, rowInfo, column) => {
                                        return {
                                          onDoubleClick: (e, handleOriginal) => {
                                          //alert('Clicked on ' + rowInfo.row.id)
                                            console.log('Cell - Double Click', {
                                              state,
                                              rowInfo,
                                              column,
                                              event: e
                                            })
                                        if (handleOriginal) {
                                                handleOriginal()
                                              }
                                      
                                        }}
                                      }}
                                    SubComponent={row => {
                                    return (
                                        <div
                                            style={{
                                            padding: '20px',
                                        }}>
                                            <ReactTable
                                                data={row.original.children}
                                                columns={labelColumns}
                                                defaultPageSize={5}
                                                showPagination={true}/>
                                        </div>
                                    )
                                }}/>
                                <br/>
                                <Tips/>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {trees: state.label.trees}
}

export default connect(mapStateToProps, actions)(Label)
