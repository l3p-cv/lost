import React, {Component} from 'react'
import {connect} from 'react-redux'

class ShowStartPipeline extends Component{

    componentDidMount(){

    }

    render(){
        return(
            <div>
                ShowStartPipeline
            </div>
        )
    }
}

const mapStateToProps = (state) =>{
    return { data: state.pipelineStart.steps[1].data }
}
export default connect(
    mapStateToProps, {}
)(ShowStartPipeline)