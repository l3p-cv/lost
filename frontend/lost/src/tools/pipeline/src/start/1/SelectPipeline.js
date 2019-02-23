import React, {Component} from 'react'
import actions from 'actions'
import {connect} from 'react-redux'


const {pipelineStart_GetTemplates, pipelineStart_SelectTab, pipelineStart_VerifyTab, pipelineStart_GetTemplate} = actions


class SelectPipeline extends Component{
    constructor(){
        super()
        this.selectRow = this.selectRow.bind(this)
    }
    async componentDidMount(){
        this.props.pipelineStart_GetTemplates()
    }

    selectRow(e){

        const id = e.currentTarget.getAttribute('id')
        this.props.pipelineStart_VerifyTab(0, true)
        this.props.pipelineStart_SelectTab(1)
        this.props.pipelineStart_GetTemplate(id)
    }

    renderDatatable(){
        if(this.props.stepData.data){
            return this.props.stepData.data.templates.map((el)=>{
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
    return {stepData: state.pipelineStart.steps[0]}
}

export default connect(
    mapStateToProps,
    {pipelineStart_GetTemplates,pipelineStart_SelectTab,pipelineStart_VerifyTab, pipelineStart_GetTemplate}
) (SelectPipeline)