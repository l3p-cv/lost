import React from 'react'
import { connect } from 'react-redux'

import '../globalComponents/node.scss'
import '../globalComponents/pipeline.scss'
import Stepper from 'react-stepper-wizard'
import SelectPipeline from './1/SelectPipeline'
import ShowRunningPipeline from './2/ShowRunningPipeline'
import actions from '../../../actions/pipeline/pipelineRunning'
import BaseContainer from '../../../components/BaseContainer'
import { CCol, CContainer, CRow } from '@coreui/react'

const { selectTab } = actions

const RunningPipeline = ({ pipelineRunning, selectTab }) => {

  const renderContent = () => {
    switch (pipelineRunning.currentStep) {
      case 0: return <SelectPipeline />
      case 1: return <ShowRunningPipeline />
      default:
        return ""
    }
  }

  const changeCurrentStep = (newStep) => {
    selectTab(newStep)
  }

  return (
    <CContainer style={{ marginTop: 15 }}>
      <CRow>
        <CCol>
          <Stepper
            stepperData={pipelineRunning}
            changeCurrentStep={changeCurrentStep}
          />
        </CCol>
      </CRow>
      <CRow>
        <BaseContainer>
          {renderContent()}
        </BaseContainer>
      </CRow>
    </CContainer>
  )
}

const mapStateToProps = (state) => {
  return { pipelineRunning: state.pipelineRunning }
}

export default connect(
  mapStateToProps,
  { selectTab }
)(RunningPipeline)
