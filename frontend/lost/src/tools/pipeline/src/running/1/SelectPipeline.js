import React, { Component } from 'react'
import actions from 'actions/pipeline/pipelineRunning'
import { connect } from 'react-redux'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import { Progress } from 'reactstrap'
import { getColor } from '../../../../../components/AnnoTask/utils'
import { alertLoading, alertClose } from 'pipelineGlobalComponents/sweetalert'
const { getPipelines, getPipeline, verifyTab, selectTab, reset } = actions





class SelectPipeline extends Component {
  constructor() {
    super()
    this.selectRow = this.selectRow.bind(this)
    this.state = {
      pollingEnabled: false
  }
  }
  async componentDidMount() {
    alertLoading()
    await this.props.getPipelines()
    alertClose()

  }

  componentDidUpdate() {
    if (this.props.data && !this.state.pollingEnabled) {
      this.setState({
        pollingEnabled: true
      })
      this.timer = setInterval(() => this.props.getPipelines(), 2000)
    }
  }

  componentWillUnmount() {
    this.setState({
      pollingEnabled: false
    })
    clearInterval(this.timer)
  }


  selectRow(id) {
    this.props.verifyTab(0, true)
    this.props.selectTab(1)
    this.props.reset()
    this.props.getPipeline(id)
  }



  renderDatatable() {

    if (this.props.data) {
      const test = this.props.data.pipes.map((el)=>{
        return{
          ...el,
          date: new Date(el.date).toDateString()
        }
      }
      )
      console.log('----------this.props.data--------------------------');
      console.log(this.props.data);
      console.log('------------------------------------');
      return (<ReactTable
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
              const progress = parseInt(row.value)
              if (row.value === "ERROR") {
                return (<div><font color="red">ERROR</font></div>)
              }
              if (row.value === "PAUSED") {
                return (<div><font color="orange">PAUSED</font></div>)
              }
              return (
                <Progress className='progress-xs rt-progress' color={getColor(progress)} value={progress} />

              )
            }
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
            desc: false
          }
        ]}
        data={test}
        defaultPageSize={10}
        className="-striped -highlight"
      />)
    }

  }

  render() {
    return (
      <div className='pipeline-running-1'>
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