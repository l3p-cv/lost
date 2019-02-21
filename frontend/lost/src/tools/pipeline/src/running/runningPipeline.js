import React, {Component} from 'react'
import {connect} from 'react-redux'

import Stepper from 'react-stepper-wizard'
import SelectPipeline from './components/1/SelectPipeline'
import ShowRunningPipeline from './components/2/ShowRunningPipeline'

class RunningPipeline extends Component{
    constructor(){
        super()
       
        
        this.verify = this.verify.bind(this)
        this.changeCurrentStep = this.changeCurrentStep.bind(this)


    }


    renderContent() {
        return(<div>Test</div>)
        switch (this.props.pipelineRunning.currentStep) {
          case 0: return (<SelectPipeline verify={this.verify} changeCurrentStep={this.changeCurrentStep} />)
          case 1: return (<ShowRunningPipeline verify={this.verify} changeCurrentStep={this.changeCurrentStep}/>)
        }
      }
    

    verify(stepIndex, verified) {      
        const steps = this.state.steps
        if (steps[stepIndex].verified != verified) {
          steps[stepIndex].verified = verified
          this.setState({ steps })
        }
      }

      changeCurrentStep(newStep) {    
        this.setState({ currentStep: newStep })
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
        console.log('---------this.props---------------------------');
        console.log(this.props);
        console.log('------------------------------------');
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
  console.log('----------state--------------------------');
  console.log(state);
  console.log('------------------------------------');
  return {pipelineRunning: state.pipelineRunning}
}


export default connect(
  mapStateToProps,
  {}
) (RunningPipeline)
