import React, { Component } from 'react'
import actions from 'actions/pipeline/pipelineStart'
import { connect } from 'react-redux'
const { getTemplates, selectTab, verifyTab, getTemplate } = actions
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import {alertLoading, alertClose} from 'pipelineGlobalComponents/sweetalert'


class SelectPipeline extends Component {
    constructor() {
        super()
        this.selectRow = this.selectRow.bind(this)
    }
    async componentDidMount() {
        alertLoading()
        await this.props.getTemplates()
        alertClose()
    }

   async selectRow(id) {
        alertLoading()
        await this.props.getTemplate(id)
        this.props.verifyTab(0, true)
        this.props.selectTab(1)
        alertClose()
    }

    renderDatatable() {
        if (this.props.data) {
            return (
                <ReactTable
                    columns={[
                        {
                            Header: "Name",
                            accessor: "name"
                        },
                        {
                            Header: "Description",
                            accessor: "description"
                        },
                        {
                            Header: "Author",
                            accessor: "author"
                        },
                        {
                            Header: "Date",
                            accessor: "date"
                        }
                    ]}
                    getTrProps={(state, rowInfo) => ({
                        onClick: () => this.selectRow(rowInfo.original.id)
                    })}
                    defaultSorted={[
                        {
                            id: "date",
                            desc: true
                        }
                    ]}
                    data={this.props.data.templates}
                    defaultPageSize={10}
                    className="-striped -highlight"
                />)
        }
    }

    render() {
        return (
            <div className='pipeline-start-1'>
                {this.renderDatatable()}
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        data: state.pipelineStart.step0Data
    }
}

export default connect(
    mapStateToProps,
    { getTemplates, selectTab, verifyTab, getTemplate }
)(SelectPipeline)