import React, {Component} from 'react'
import actions from 'actions/pipeline/pipelineStart'
import {connect} from 'react-redux'


const {getTemplates, selectTab, verifyTab, getTemplate} = actions


class SelectPipeline extends Component{
    constructor(){
        super()
        this.selectRow = this.selectRow.bind(this)
    }
    async componentDidMount(){
        this.props.getTemplates()
    }

    selectRow(e){

        const id = e.currentTarget.getAttribute('id')
        this.props.verifyTab(0, true)
        this.props.selectTab(1)
        this.props.getTemplate(id)
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
    {getTemplates,selectTab,verifyTab, getTemplate}
) (SelectPipeline)