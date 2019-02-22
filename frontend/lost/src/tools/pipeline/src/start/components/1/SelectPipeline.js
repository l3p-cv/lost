import React, {Component} from 'react'
import actions from 'actions'
import {connect} from 'react-redux'
import * as http from '../../../http'

const {pipelineStartGetTemplates, pipelineStartSelectTab, pipelineStartVerifyTab, pipelineStartGetTemplate} = actions


class SelectPipeline extends Component{
    constructor(){
        super()
        this.selectRow = this.selectRow.bind(this)
    }
    async componentDidMount(){
        this.props.pipelineStartGetTemplates()
    }

    selectRow(e){

        const id = e.currentTarget.getAttribute('id')
        this.props.pipelineStartVerifyTab(0, true)
        this.props.pipelineStartSelectTab(1)
        this.props.pipelineStartGetTemplate(id)
    }

    renderDatatable(){
        if(this.props.data){
            return this.props.data.templates.map((el)=>{
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
    return {data: state.pipelineStart.steps[0].data}
}

export default connect(
    mapStateToProps,
    {pipelineStartGetTemplates,pipelineStartSelectTab,pipelineStartVerifyTab, pipelineStartGetTemplate}
) (SelectPipeline)