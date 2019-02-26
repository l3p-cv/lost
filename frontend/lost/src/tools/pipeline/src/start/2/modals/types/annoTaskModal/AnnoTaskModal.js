import React, { Component } from 'react'
import Stepper from 'react-stepper-wizard'
import { connect } from 'react-redux'
import actions from 'actions/pipeline/pipelineStartModals/annoTask'
import UserInfo from './1/UserInfo'
import SelectUser from './2/SelectUser'
import SelectTree from './3/SelectTree'
import SelectLabel from './4/SelectLabel'
// import GrayLine from '../../..&globalComponents/grayLine'

 const { selectTab, verifyTab } = actions

class AnnoTaskModal extends Component {
    constructor(){
        super()
        this.changeCurrentStep = this.changeCurrentStep.bind(this)
    }
    changeCurrentStep(newStep) {
        this.props.selectTab(newStep, this.props.peN)
    }

    renderContent() {
        switch (this.props.stepper.currentStep) {
            case 0: return (<UserInfo {...this.props}/>)
            case 1: return (<SelectUser 
                {...this.props} 
                />)
            case 2: return (<SelectTree 
                {...this.props} 
                />)
            case 3: return (<SelectLabel />)
        }
    }

    renderStepper(){
        if(this.props.stepper.steps){
            return(
                <Stepper
                    stepperData={this.props.stepper}
                    changeCurrentStep={this.changeCurrentStep}
                />
            )
        }
    }

    render() {
        return (
            <div>
                {this.renderStepper()}
                {this.renderContent()}
            </div>
        )
    }
}

export default connect(
    null,
    { selectTab, verifyTab }
)(AnnoTaskModal)