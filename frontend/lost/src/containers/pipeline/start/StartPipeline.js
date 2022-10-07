import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Stepper from 'react-stepper-wizard'
import actions from '../../../actions/pipeline/pipelineStart'
import { TourProvider } from '@reactour/tour'

import '../globalComponents/node.scss'
import '../globalComponents/pipeline.scss'
import SelectPipeline from './1/SelectPipeline'
import ShowStartPipeline from './2/ShowStartPipeline'
import StartPipelineForm from './3/StartPipelineForm'
import StartRunPipeline from './4/StartPipeline'
import BaseContainer from '../../../components/BaseContainer'
import PipelineTour from '../../../components/tours/PipelineTour'

const { selectTab } = actions

const StartPipeline = () => {
    const dispatch = useDispatch()
    const stepperData = useSelector((state) => state.pipelineStart.stepper)
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
            <TourProvider showNavigation={false}>
                <PipelineTour currentPipelineStep={stepperData.currentStep} />
                <Stepper
                    stepperData={stepperData}
                    changeCurrentStep={(newTab) => { dispatch(selectTab(newTab)) }}
                />
                {renderContent()}
            </TourProvider>
        </BaseContainer>
    )
}


export default StartPipeline
