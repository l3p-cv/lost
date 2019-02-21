import React, {Component} from 'react'
import actions from '../../../../../../actions'
import {connect} from 'react-redux'
import * as http from '../../../http'

const {getPipelines, verifyTab, selectTab} = actions



class SelectPipeline extends Component{
    constructor(){
        super()
        this.selectRow = this.selectRow.bind(this)
    }
    async componentDidMount(){
        this.props.getPipelines()
    }

    selectRow(){
        this.props.verifyTab(0, true)
        this.props.selectTab(1)
    }


    renderDatatable(){
        if(this.props.data){
            return this.props.data.pipes.map((el)=>{
                return (<div key={el.name} onClick={this.selectRow}>{el.name}</div>)
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
    return {data: state.pipelineRunning.steps[0].data}
}

export default connect(
    mapStateToProps,
    {getPipelines,verifyTab, selectTab}
) (SelectPipeline)