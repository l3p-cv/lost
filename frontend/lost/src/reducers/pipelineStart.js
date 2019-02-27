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
          verified: true,
        },
        {
          text: '2',
          icon: 'fa-server',
          shapeBorderColor: '#f4b042',
          shapeBackgroundColor: 'white',
          shapeContentColor: '#f4b042',
          verified: false,
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

        // ANNO TASK START

        case 'PIPELINE_START_ANNO_TASK_SELECT_TAB':
            return {
                ...state,
                step1Data:{
                    ...state.step1Data,
                    elements: state.step1Data.elements.map((el)=>{
                        if('annoTask' in el && (el.peN == action.payload.elementId)){
                            return {
                                ...el,
                                stepper: {
                                    ...el.stepper,
                                    currentStep: action.payload.tabId
                                }
                            }
                        }
                        return el
                    })
                }
            }
        case 'PIPELINE_START_ANNO_TASK_VERIFY_TAB':
            return {
                ...state,
                step1Data: {
                    ...state.step1Data,
                    elements: state.step1Data.elements.map((el)=> {
                        if('annoTask' in el && (el.peN == action.payload.elementId)){
                            return {
                                ...el,
                                stepper: {
                                    ...el.stepper,
                                    steps: el.stepper.steps.map((el,i )=>{
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
                        }
                        return el
                    })
                }
            }
        case 'PIPELINE_START_ANNO_TASK_NAME_INPUT':
            return{
                ...state,
                step1Data:{
                    ...state.step1Data,
                    elements: state.step1Data.elements.map((el)=>{
                        if('annoTask' in el && (el.peN == action.payload.elementId)){
                            return {
                                ...el,
                                exportData: {
                                    ...el.exportData,
                                    annoTask: {
                                        ...el.exportData.annoTask,
                                        name: action.payload.value
                                    }
                                }
                            }
                        }
                        return el
                    })
                }
            }
        case 'PIPELINE_START_ANNO_TASK_INSTRUCTIONS_INPUT':
        return{
            ...state,
            step1Data:{
                ...state.step1Data,
                elements: state.step1Data.elements.map((el)=>{
                    if('annoTask' in el && (el.peN == action.payload.elementId)){
                        return {
                            ...el,
                            exportData: {
                                ...el.exportData,
                                annoTask: {
                                    ...el.exportData.annoTask,
                                    instructions: action.payload.value
                                }
                            }
                        }
                    }
                    return el
                })
            }
        }
        case 'PIPELINE_START_ANNO_TASK_SELECT_USER':
        return{
            ...state,
            step1Data:{
                ...state.step1Data,
                elements: state.step1Data.elements.map((el)=>{
                    if('annoTask' in el && (el.peN == action.payload.elementId)){
                        return {
                            ...el,
                            exportData: {
                                ...el.exportData,
                                annoTask: {
                                    ...el.exportData.annoTask,
                                    assignee: action.payload.assignee,
                                    workerId: parseInt(action.payload.workerId)
                                }
                            }
                        }
                    }
                    return el
                })
            }
        }
        case 'PIPELINE_START_ANNO_TASK_SELECT_TREE':
        return{
            ...state,
            step1Data:{
                ...state.step1Data,
                elements: state.step1Data.elements.map((el)=>{
                    if('annoTask' in el && (el.peN == action.payload.elementId)){
                        return {
                            ...el,
                            exportData: {
                                ...el.exportData,
                                annoTask: {
                                    ...el.exportData.annoTask,
                                    selectedLabelTree: parseInt(action.payload.value),
                                }
                            }
                        }
                    }
                    return el
                })
            }
        }
        case 'PIPELINE_START_ANNO_TASK_UPDATE_LABELS':
        return{
            ...state,
            step1Data:{
                ...state.step1Data,
                elements: state.step1Data.elements.map((el)=>{
                    if('annoTask' in el && (el.peN == action.payload.elementId)){
                        return {
                            ...el,
                            exportData: {
                                ...el.exportData,
                                annoTask: {
                                    ...el.exportData.annoTask,
                                    labelLeaves: action.payload.lableArr
                                }
                            }
                        }
                    }
                    return el
                })
            }
        }
        case 'PIPELINE_START_VERIFY_ANNO_TASK_NODE':
        return{
            ...state,
            step1Data:{
                ...state.step1Data,
                elements: state.step1Data.elements.map((el)=>{
                    if('annoTask' in el && (el.peN == action.payload.elementId)){
                        return {
                            ...el,
                            verified: action.payload.verified
                        }
                    }
                    return el
                })
            }
        }
        // ANNO TASK END

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
                                verified: false,
                                exportData: {
                                    peN: el.peN,
                                    peOut: el.peOut,
                                    annoTask:{
                                        name: el.annoTask.name,
                                        type: el.annoTask.type,
                                        instructions: el.annoTask.instructions,
                                        configuration: el.annoTask.configuration,
                                        assignee: null,
                                        workerId: null,
                                        labelLeaves: [],
                                        selectedLabelTree: null


                                    }
                                }
                            }
                        }
                        return el
                        
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