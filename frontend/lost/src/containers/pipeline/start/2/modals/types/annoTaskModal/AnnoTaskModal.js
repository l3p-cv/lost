import React, { Component } from 'react'
import Stepper from 'react-stepper-wizard'
import { connect } from 'react-redux'
import actions from '../../../../../../../actions/pipeline/pipelineStartModals/annoTask'
import UserInfo from './1/UserInfo'
import SelectUser from './2/SelectUser'
import SelectTree from './3/SelectTree'
import SelectLabel from './4/SelectLabel'
import SelectSIAConfiguration from './5/SelectSIAConfiguration'
import SelectMIAConfiguration from './5/SelectMIAConfiguration'
// import GrayLine from '../../..&globalComponents/GrayLine'

const { selectTab, verifyTab } = actions

class AnnoTaskModal extends Component {
    constructor() {
        super()
        this.changeCurrentStep = this.changeCurrentStep.bind(this)
    }
    changeCurrentStep(newStep) {
        this.props.selectTab(this.props.peN, newStep)
    }

    renderContent() {
        switch (this.props.stepper.currentStep) {
            case 0:
                return <UserInfo {...this.props} />
            case 1:
                return <SelectUser {...this.props} />
            case 2:
                return <SelectTree {...this.props} />
            case 3:
                return <SelectLabel {...this.props} />
            case 4:
                if (this.props.annoTask.type === 'sia') {
                    return <SelectSIAConfiguration {...this.props} />
                } else if (this.props.annoTask.type === 'mia') {
                    return <SelectMIAConfiguration {...this.props} />
                }
            default:
                break
        }
    }

    renderStepper() {
        if (this.props.stepper.steps) {
            return (
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

export default connect(null, { selectTab, verifyTab })(AnnoTaskModal)
