import React, {Component} from 'react'
import Stepper from 'react-stepper-wizard'
import SelectPipeline from './components/1/SelectPipeline'
import ShowRunningPipeline from './components/2/ShowRunningPipeline'

class RunningPipeline extends Component{
    constructor(){
        super()
        this.state = {
            style: {
                container: {
                  paddingTop: 24,          //pixel
                  paddingBottom: 24,       //pixel
                },
                shape: {
                  size: 80,
                  borderWidth: 4,
                  borderRadius: '50%',
                },
                line: {
                  borderWidth: 3,
                  borderColor: 'gray',
                  padding: 30
                }
              },
            steps: [
                {
                  text: '1',
                  icon: 'fa-server',
                  shapeBorderColor: 'green',
                  shapeBackgroundColor: 'white',
                  shapeContentColor: 'green',
                  verified: false,
                },
                {
                  text: '2',
                  icon: 'fa-server',
                  shapeBorderColor: '#f4b042',
                  shapeBackgroundColor: 'white',
                  shapeContentColor: '#f4b042',
                  verified: false,
                },
            ],
            currentStep: 0
        }
        
        this.verify = this.verify.bind(this)
        this.changeCurrentStep = this.changeCurrentStep.bind(this)


    }


    renderContent() {
        switch (this.state.currentStep) {
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
    

    render(){
        return(
            <Stepper
            stepperData={this.state}
            changeCurrentStep={this.changeCurrentStep}
          />
        )
    }
}

export default RunningPipeline