import React, { Component } from 'react'
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {Button} from 'reactstrap'
import {connect} from 'react-redux'
import actions from 'actions/pipeline/pipelineStart'
const {postPipeline} = actions
class StartPipeline extends Component {
    constructor(){
        super()
        this.startPipe = this.startPipe.bind(this)
    }
    startPipe(){
        console.log('-------this.propsthis.props-----------------------------');
        console.log(this.props);
        console.log('------------------------------------');
        const json = {}
        json.name = this.props.step2Data.name
        json.description = this.props.step2Data.description
        json.elements = this.props.step1Data.elements.map(el=>el.exportData)
        json.templateId = this.props.step0Data.templateId
        this.props.postPipeline(json)
        console.log('----json--------------------------------');
        console.log(json);
        console.log('------------------------------------');
    }

    componentDidMount(){
        console.log('---------iopop1---------------------------');
        console.log(this.props);
        console.log('------------------------------------');
    }

    render() {
        return (
                <div className='pipeline-start-tab3-conainer'>
                    <h3>Complete</h3>
                    <p>You have successfully completed all steps.</p>
                    <Button onClick={this.startPipe} color="primary" size="lg">
                        <FontAwesomeIcon icon={faPlayCircle} size="5x" />
                        Start Pipe
                    </Button>
                </div>
        )
    }
}

const mapStateToProps = (state) =>{
    return {
        step0Data: state.pipelineStart.step0Data,
        step1Data: state.pipelineStart.step1Data,
        step2Data: state.pipelineStart.step2Data,
        step3Data: state.pipelineStart.step3Data
    }
}

export default connect(mapStateToProps, {postPipeline})(StartPipeline)





{/* <div>
<div style={{width: '50%', margin: 0, textAlign:'center'}}>
    <h3 className='title-start-pipeline-completed' >Complete</h3>
    <p>You have successfully completed all steps.</p>
    <button data-ref='btnStartPipe' type='button' className='btn btn-primary btn-lg'>
        <FontAwesomeIcon icon={faPlayCircle} size="5x" />
        Start Pipe
    </button>
</div>
</div> */}
        