import React, { Component } from 'react'
import Stepper from 'react-stepper-wizard'
import { connect } from 'react-redux'
import actions from 'actions/pipeline/pipelineStartAnnoTask'
import UserInfo from './1/UserInfo'
import SelectUser from './2/SelectUser'
import SelectTree from './3/SelectTree'
import SelectLabel from './4/SelectLabel'
import GrayLine from '../../../../../globalComponents/grayLine'
// import GrayLine from '../../..&globalComponents/grayLine'

const { selectTab } = actions

class AnnoTaskModal extends Component {
    constructor(){
        super()
        this.changeCurrentStep = this.changeCurrentStep.bind(this)
    }
    changeCurrentStep(newStep) {

        this.props.selectTab(newStep)
    }

    renderContent() {
        switch (this.props.pipelineStartAnnoTask.currentStep) {
            case 0: return (<UserInfo />)
            case 1: return (<SelectUser />)
            case 2: return (<SelectTree />)
            case 3: return (<SelectLabel />)
        }
    }


    render() {
        console.log('------------this.props------------------------');
        console.log(this.props);
        console.log('------------------------------------');
        return (
            <div>
                <Stepper
                    stepperData={this.props.pipelineStartAnnoTask}
                    changeCurrentStep={this.changeCurrentStep}
                />
                <GrayLine />
                {this.renderContent()}
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return { pipelineStartAnnoTask: state.pipelineStartAnnoTask }
}
export default connect(
    mapStateToProps,
    { selectTab }
)(AnnoTaskModal)