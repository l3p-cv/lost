import React, {Component} from 'react'
import * as http from '../../../http'
class SelectPipeline extends Component{
    constructor(){
        super()
        this.selectRow = this.selectRow.bind(this)
    }
    async componentDidMount(){
        const pipelines = await http.requestPipelines()
        this.setState(pipelines)
    }
    selectRow(){
        this.props.verify(0, true)
        this.props.changeCurrentStep(1)
    }


    renderDatatable(){
        if(this.state){
            return this.state.pipes.map((el)=>{
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

export default SelectPipeline