import React, {Component} from 'react'
import actions from 'actions'
import {connect} from 'react-redux'

const {getPipelines, getPipeline, verifyTab, selectTab} = actions


class SelectPipeline extends Component{
    constructor(){
        super()
        this.selectRow = this.selectRow.bind(this)
    }
    async componentDidMount(){
        this.props.getPipelines()
    }

    selectRow(e){
        const id = e.currentTarget.getAttribute('id')
        this.props.verifyTab(0, true)
        this.props.selectTab(1)
        this.props.getPipeline(id)
    }

    renderDatatable(){
        if(this.props.stepData.data){
            return this.props.stepData.data.pipes.map((el)=>{
                return (<div id={el.id} key={el.id} onClick={this.selectRow}>{el.name}</div>)
            })
        }
    }

    render(){
        return (
            <div>
                {this.renderDatatable()}
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {stepData: state.pipelineRunning.steps[0]}
}

export default connect(
    mapStateToProps,
    {getPipelines,getPipeline,verifyTab, selectTab}
) (SelectPipeline)