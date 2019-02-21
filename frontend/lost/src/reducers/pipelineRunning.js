const INITITAL_STATE = {
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



export default (state = INITITAL_STATE, action) => {
    switch(action.type){
        case 'GET_PIPELINES':  
            return {
                ...state,
                steps: state.steps.map((el,i)=>{
                    // If first TAB
                    if(!i){
                        return {
                            ...el,
                            data :action.payload}
                    }
                    return el
                })
            }
        case 'SELECT_TAB':
            return state
        case 'VERIFY_TAB':
            return {
                ...state,
                steps: state.steps.map((el,i)=>{
                    // if 
                    if(i === action.payload.tabId){
                        return {
                            ...el,
                            verified: action.payload.verified
                        }
                    }
                    return el
                })
            }
            console.log('----------state--------------------------');
            console.log(state);
            console.log('------------------------------------');
            console.log('----------action--------------------------');
            console.log(action);
            console.log('------------------------------------');
            
            return state
        default:
            return state
        
    }
}