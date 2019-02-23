import React, { Component } from 'react'
import Stepper from 'react-stepper-wizard'
import { connect } from 'react-redux'
import actions from 'actions'
import '../forAllComponents/node.scss'
import SelectPipeline from './1/SelectPipeline'
import ShowStartPipeline from './2/ShowStartPipeline'
import StartPipelineForm from './3/StartPipelineForm'
import StartRunPipeline from './4/StartPipeline'

import GrayLine from '../forAllComponents/grayLine'

const { pipelineStart_SelectTab } = actions

class StartPipeline extends Component {
    constructor(){
        super()
        this.changeCurrentStep = this.changeCurrentStep.bind(this)
    }
    changeCurrentStep(newStep) {

        this.props.pipelineStart_SelectTab(newStep)
    }

    renderContent() {
        switch (this.props.pipelineStart.currentStep) {
            case 0: return (<SelectPipeline />)
            case 1: return (<ShowStartPipeline />)
            case 2: return (<StartPipelineForm />)
            case 3: return (<StartRunPipeline />)
        }
    }


    render() {
        return (
            <div>
                <Stepper
                    stepperData={this.props.pipelineStart}
                    changeCurrentStep={this.changeCurrentStep}
                />
                <GrayLine />
                {this.renderContent()}
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return { pipelineStart: state.pipelineStart }
}
export default connect(
    mapStateToProps,
    { pipelineStart_SelectTab }
)(StartPipeline)