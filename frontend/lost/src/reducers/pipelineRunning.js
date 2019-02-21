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
            return action.payload.pipes
        case 'SELECT_TAB':
            return state
        case 'VERIFY_TAB':
            return state
        default:
            return state
        
    }
}