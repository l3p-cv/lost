import React from 'react'
import Stepper from 'react-stepper-wizard'
import { connect } from 'react-redux'
import actions from '../../../actions/pipeline/pipelineStart'

import '../globalComponents/node.scss'
import '../globalComponents/pipeline.scss'
import SelectPipeline from './1/SelectPipeline'
import ShowStartPipeline from './2/ShowStartPipeline'
import StartPipelineForm from './3/StartPipelineForm'
import StartRunPipeline from './4/StartPipeline'
import BaseContainer from '../../../components/BaseContainer'
const { selectTab } = actions

const StartPipeline = ({ stepperData, selectTab }) => {

    const changeCurrentStep = (newStep) => {
        selectTab(newStep)
    }

    const renderContent = () => {

        switch (stepperData.currentStep) {
            case 0: return (<SelectPipeline />)
            case 1: return (<ShowStartPipeline />)
            case 2: return (<StartPipelineForm />)
            case 3: return (<StartRunPipeline />)
            default:
                break
        }
    }

    return (
        <BaseContainer className='pipeline-start-container'>
            <Stepper
                stepperData={stepperData}
                changeCurrentStep={changeCurrentStep}
            />
            {renderContent()}
        </BaseContainer>
    )
}

const mapStateToProps = (state) => {
    return { stepperData: state.pipelineStart.stepper }
}
export default connect(
    mapStateToProps,
    { selectTab }
)(StartPipeline)