import React, {Component} from 'react'
import {connect} from 'react-redux'

import Stepper from 'react-stepper-wizard'
import SelectPipeline from './components/1/SelectPipeline'
import ShowRunningPipeline from './components/2/ShowRunningPipeline'
import actions from 'actions'
const {selectTab} = actions


class RunningPipeline extends Component{
    constructor(){
        super()
        this.changeCurrentStep = this.changeCurrentStep.bind(this)
    }


    renderContent() {
        switch (this.props.pipelineRunning.currentStep) {
          case 0: return (<SelectPipeline />)
          case 1: return (<ShowRunningPipeline />)
        }
      }
    


      changeCurrentStep(newStep) {    
        this.props.selectTab(newStep)
      }
    
      renderGrayLine() {
        return (
          <hr
            style={{
              color: 'gray',
              backgroundColor: 'gray',
              height: 1
            }}
          />
        )
      }


    render(){
        return(
            <div>
            <Stepper
            stepperData={this.props.pipelineRunning}
            changeCurrentStep={this.changeCurrentStep}
          />
          {this.renderGrayLine()}
          <br />
          <br />
          
  
          {this.renderContent()}
          </div>
        )
    }
}



const mapStateToProps = (state) => {
  return {pipelineRunning: state.pipelineRunning}
}


export default connect(
  mapStateToProps,
  {selectTab}
) (RunningPipeline)
