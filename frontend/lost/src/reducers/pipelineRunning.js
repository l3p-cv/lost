export default (state = [], action) => {
    switch(action.type){
        case 'GET_PIPELINES':
        console.log('----------state--------------------------');
        console.log(state);
        console.log('------------------------------------');
        console.log('----------action--------------------------');
        console.log(action);
        console.log('------------------------------------');
            
            return action.payload.pipes
        default:
            return state
    }
}