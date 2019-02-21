import React, {Component} from 'react'
import actions from '../../../../../../actions'
import {connect} from 'react-redux'
import * as http from '../../../http'

const {getPipelines} = actions



class SelectPipeline extends Component{
    constructor(){
        super()
        this.selectRow = this.selectRow.bind(this)
    }
    async componentDidMount(){

        this.props.getPipelines()
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
        console.log('---------this.props---------------------------');
        console.log(this.props);
        console.log('------------------------------------');
        return (
            <div>
                {this.renderDatatable()}

            </div>
        )
    }
}

const mapStateToProps = (state) => {
    console.log('------------------------------------');
    console.log("MAPSTAATETOPROPS");
    console.log('------------------------------------');
    return {test: state}
}

export default connect(
    mapStateToProps,
    {getPipelines}
) (SelectPipeline)