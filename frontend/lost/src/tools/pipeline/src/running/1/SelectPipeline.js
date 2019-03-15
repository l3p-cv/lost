import React, { Component } from 'react'
import actions from 'actions/pipeline/pipelineRunning'
import { connect } from 'react-redux'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import {Progress} from 'reactstrap'
import {getColor} from '../../../../../components/AnnoTask/utils'
import {alertLoading, alertClose} from 'pipelineGlobalComponents/sweetalert'
const { getPipelines, getPipeline, verifyTab, selectTab, reset } = actions





class SelectPipeline extends Component {
    constructor() {
        super()
        this.selectRow = this.selectRow.bind(this)
    }
    async componentDidMount() {
        alertLoading()
        await this.props.getPipelines()
        alertClose()

    }

    selectRow(id) {
        this.props.verifyTab(0, true)
        this.props.selectTab(1)
        this.props.reset()
        this.props.getPipeline(id)
    }



    renderDatatable() {
        if(this.props.data){
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
                        if(row.value==="ERROR"){
                          return(<div><font color="red">ERROR</font></div>)
                        }
                        return(
                          <Progress className='progress-xs' color={getColor(progress)} value={progress}/>

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
    { getPipelines, getPipeline, verifyTab, selectTab, reset }
)(SelectPipeline)