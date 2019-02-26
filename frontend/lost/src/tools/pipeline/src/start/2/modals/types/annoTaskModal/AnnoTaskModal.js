import React, { Component } from 'react'
import Stepper from 'react-stepper-wizard'
import { connect } from 'react-redux'
import actions from 'actions'
import UserInfo from './1/UserInfo'
import SelectUser from './2/SelectUser'
import SelectTree from './3/SelectTree'
import SelectLabel from './4/SelectLabel'
// import GrayLine from '../../..&globalComponents/grayLine'

 const { selectTabAnnoTask, verifyTabAnnoTask } = actions

class AnnoTaskModal extends Component {
    constructor(){
        super()
        this.changeCurrentStep = this.changeCurrentStep.bind(this)
    }
    changeCurrentStep(newStep) {
        this.props.selectTabAnnoTask(newStep)
    }

    renderContent() {
        switch (this.props.stepper.currentStep) {
            case 0: return (<UserInfo />)
            case 1: return (<SelectUser />)
            case 2: return (<SelectTree />)
            case 3: return (<SelectLabel />)
        }
        this.props.verifyTabAnnoTask(0, true)
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
    { selectTabAnnoTask, verifyTabAnnoTask }
)(AnnoTaskModal)