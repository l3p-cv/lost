const INITITAL_STATE = {
    stepper: {
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
              padding: 0
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
              modalOpened: false,
              modalClickedId: 0,
              svgStyle: {
                width: "800px"
            }
            },
            {
                text: '3',
                icon: 'fa-server',
                shapeBorderColor: '#f4b042',
                shapeBackgroundColor: 'white',
                shapeContentColor: '#f4b042',
                verified: false,
            },
            {
                text: '4',
                icon: 'fa-server',
                shapeBorderColor: '#f4b042',
                shapeBackgroundColor: 'white',
                shapeContentColor: '#f4b042',
                verified: false,
             }
        ],
        currentStep: 0
    }
}


const INITITAL_STATE_ANNO_TASK_MODAL = {
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
          padding: 0
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
          modalOpened: false,
          modalClickedId: 0,
          svgStyle: {
            width: "800px"
        }
        },
        {
            text: '3',
            icon: 'fa-server',
            shapeBorderColor: '#f4b042',
            shapeBackgroundColor: 'white',
            shapeContentColor: '#f4b042',
            verified: false,
        },
        {
            text: '4',
            icon: 'fa-server',
            shapeBorderColor: '#f4b042',
            shapeBackgroundColor: 'white',
            shapeContentColor: '#f4b042',
            verified: false,
         }
    ],
    currentStep: 0
}

export default (state = INITITAL_STATE, action)=>{
    switch(action.type){
        case 'PIPELINE_START_SELECT_TAB':
        return {
            ...state,
            stepper: {
                ...state.stepper,
                currentStep: action.payload.tabId
            }
        }
        case 'PIPELINE_START_VERIFY_TAB':
        return {
            ...state,
            stepper: {
                ...state.stepper,
                steps: state.stepper.steps.map((el,i)=>{
                    if(i === action.payload.tabId){
                        return {
                            ...el,
                            verified: action.payload.verified
                        }
                    }
                    return el
                })
            }
        }
        case 'PIPELINE_START_ANNO_TASK_SELECT_TAB':
            return {
                
            }
        case 'PIPELINE_START_ANNO_TASK_VERIFY_TAB':

        case 'PIPELINE_START_GET_TEMPLATES':
            return {
                ...state,
                step0Data: action.payload

            }
        case 'PIPELINE_START_GET_TEMPLATE':

            return {
                ...state,
                step1Data: {
                    ...action.payload,
                    elements: action.payload.elements.map((el) =>{
                        if('annoTask' in el){
                            return {
                                ...el,
                                stepper: INITITAL_STATE_ANNO_TASK_MODAL,
                                exportData: {
                                    peN: el.peN,
                                    peOut: el.peOut,
                                    annoTask:{
                                        name: el.annoTask.name,
                                        type: el.annoTask.type,
                                        instructions: el.annoTask.instructions,
                                        configuration: el.annoTask.configuration 
                                    }
                                }
                            }
                        }else {
                            return el
                        }
                    })
                }
            }
        case 'PIPELINE_START_TOGGLE_MODAL':
            return {
                ...state,
                stepper: {
                    ... state.stepper,
                    steps: state.stepper.steps.map((el,i)=>{
                        // Graph Data
                        if(i == 1){
                            return {
                                ...el,
                                modalOpened : !state.stepper.steps[1].modalOpened,
                                modalClickedId: action.payload.id
                            }
                        }
                        return el
                    })
                }

            }
        default:
            return state
    }

}