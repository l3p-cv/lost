import React, { Component } from 'react'
import actions from '../../../../../../../../actions/pipeline/pipelineStartModals/annoTask'
import HelpButton from '../../../../../../../../components/HelpButton'
import IconButton from '../../../../../../../../components/IconButton'
import { faTags } from '@fortawesome/free-solid-svg-icons'
import { connect } from 'react-redux'
import { Card, CardBody } from 'reactstrap'
import ReactTable from 'react-table'
const { selectLabelTree } = actions
class SelectTree extends Component {
    constructor() {
        super()
        this.selectRow = this.selectRow.bind(this)
    }

    selectRow(row) {
        this.props.selectLabelTree(this.props.peN, row.idx)
        this.props.verifyTab(this.props.peN, 2, true)
        this.props.selectTab(this.props.peN, 3)
    }

    renderTable() {
        // return this.props.availableLabelTrees.map((el)=>{
        //     return(
        //         <div key={el.idx} id={el.idx} onClick={this.selectRow}>{el.name}</div>
        //     )
        // })
        return (
            <ReactTable
                columns={[
                    // {
                    //     Header: 'ID',
                    //     accessor: 'idx',
                    // },
                    {
                        Header: 'Name',
                        accessor: 'name',
                    },
                    {
                        Header: 'Description',
                        accessor: 'description',
                        Cell: (row) => {
                            return (
                                <HelpButton
                                    id={row.original.idx}
                                    text={row.original.description}
                                />
                            )
                        },
                    },
                    {
                        Header: 'Choose',
                        accessor: 'name',
                        Cell: (row) => {
                            return (
                                <IconButton
                                    isOutline={false}
                                    color="primary"
                                    icon={faTags}
                                    text="Choose"
                                    onClick={() => this.selectRow(row.original)}
                                />
                            )
                        },
                    },
                ]}
                // getTrProps={(state, rowInfo) => ({
                //     onClick: () => this.selectRow(rowInfo.original),
                // })}
                defaultSorted={[
                    {
                        id: 'name',
                        desc: true,
                    },
                ]}
                data={this.props.availableLabelTrees}
                defaultPageSize={10}
                className="-striped -highlight"
            />
        )
    }
    render() {
        return (
            <Card className="annotask-modal-card">
                <CardBody>{this.renderTable()}</CardBody>
            </Card>
        )
    }
}

export default connect(null, { selectLabelTree })(SelectTree)
