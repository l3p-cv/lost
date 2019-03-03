import React, { Component } from 'react'
import actions from 'actions/pipeline/pipelineRunning'
import { connect } from 'react-redux'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import {alertLoading, alertClose} from 'pipelineGlobalComponents/sweetalert'
const { getPipelines, getPipeline, verifyTab, selectTab } = actions


class SelectPipeline extends Component {
    constructor() {
        super()
        this.selectRow = this.selectRow.bind(this)
    }
    async componentDidMount() {
        alertLoading()
        this.props.getPipelines()
    }

    selectRow(id) {
        this.props.verifyTab(0, true)
        this.props.selectTab(1)
        this.props.getPipeline(id)
    }



    renderDatatable() {
        if(this.props.data){
            alertClose()
            return(<ReactTable
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
                    Header: "Template Name",
                    accessor: "templateName"
                  },
                  {
                    Header: "Author",
                    accessor: "creatorName"
                  },
                  {
                    Header: "Progress",
                    accessor: "progress",
                    Cell: (row) => {
                        const progress= parseInt(row.value)
                        return(
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#dadada',
                            borderRadius: '2px'
                          }}
                        >
                          <div
                            style={{
                              width: `${progress}%`,
                              height: '100%',
                              backgroundColor: progress > 66 ? '#85cc00'
                                : progress > 33 ? '#ffbf00'
                                : '#ff2e00',
                              borderRadius: '2px',
                              transition: 'all .2s ease-out'
                            }}
                          />
                        </div>
                      )}
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
                data={this.props.data.pipes}
                defaultPageSize={10}
                className="-striped -highlight"
              />)
        }
        
    }

    render() {
        return (
            <div>
                {this.renderDatatable()}
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return { data: state.pipelineRunning.step0Data }
}

export default connect(
    mapStateToProps,
    { getPipelines, getPipeline, verifyTab, selectTab }
)(SelectPipeline)