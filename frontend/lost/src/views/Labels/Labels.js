import React, {Component} from 'react'
import {connect} from 'react-redux'
import actions from '../../actions'
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

const {getLabelTrees} = actions

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
            }, {
                Header: 'Group',
                accessor: 'groupName'
            }, {
                Header: 'Controls'
            }
        ]
    }
]
const labelColumns = [
    {

        Header: 'Name',
        accessor: 'name'
    }, {
        Header: 'Description',
        accessor: 'description'
    }, {
        Header: 'Leaf ID',
        accessor: 'leafId'
    }
]

class Label extends Component {
 
    componentDidMount() {
        this.props.getLabelTrees()
    }
    render() {
        const data = this.props.trees
        console.log(data)
        //const data = this.state.data
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
                                    SubComponent={row => renderSubComponent(row)}/>
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

function renderSubComponent(row) {
    if (row.original.children !== undefined && row.original.children.length>0) {
        return (
            <div style={{
                padding: '10px'
            }}>
                <ReactTable
                    data={row.original.children}
                    columns={labelColumns}
                    pageSize={row.original.children.length}
                    showPagination={false}
                    minRows = {0}
                    getTrProps={(state, rowInfo, column) => getProps(state, rowInfo, column)}
                    SubComponent={row => renderSubComponent(row)}/>
            </div>
        )
    } else {
        return (
            <div style={{
                padding: '10px'
            }}>
                <Alert color='info'>Linked Annotations: 
                    <Badge>{row.original.name}</Badge>   |   Created by: 
                    <Badge>{row.original.description}</Badge>
                </Alert>
            </div>
        )
    }
}
function mapStateToProps(state) {
    console.log(state.label.trees)
    return {trees: state.label.trees}
}

export default connect(mapStateToProps, {getLabelTrees})(Label)
