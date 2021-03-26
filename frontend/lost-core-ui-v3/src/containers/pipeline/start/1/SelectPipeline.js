import React, { Component } from 'react'
import actions from '../../../../actions/pipeline/pipelineStart'
import { connect } from 'react-redux'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
const { getTemplates, selectTab, verifyTab, getTemplate } = actions

class SelectPipeline extends Component {
    constructor() {
        super()
        this.selectRow = this.selectRow.bind(this)
    }
    async componentDidMount() {
        await this.props.getTemplates()
    }

   async selectRow(id) {
        await this.props.getTemplate(id)
        this.props.verifyTab(0, true)
        this.props.selectTab(1)
    }

    renderDatatable() {

        if (this.props.data) {
            if(this.props.data.error){
                return(
                    <div className='pipeline-error-message'>{this.props.data.error}</div>
                )
            }
            const data = this.props.data.response.templates.map(el=>(
                    {
                    ...el,
                    date: new Date(el.date)
                    }
              ))
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
                            Cell:(row) => {
                                return(new Date(row.value).toLocaleString('de'))
                              },
                            accessor: "date",
                            sortMethod: (date1, date2) => {
                                if(new Date(date1) > new Date(date2)){
                                  return -1
                                }
                                return 1
                              }
                        }
                    ]}
                    getTrProps={(state, rowInfo) => ({
                        onClick: () => this.selectRow(rowInfo.original.id)
                    })}
                    defaultSorted={[
                        {
                          id: "date",
                          desc: false
                        }
                      ]}
                    data={data}
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