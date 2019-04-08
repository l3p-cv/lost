import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import auth from './auth'
import label from './label'
import group from './group'
import user from './user'
import annoTask from './annoTask'
import mia from './mia'
import worker from './worker'
import pipelineRunning from './pipelineRunning'
import pipelineStart from './pipelineStart'

const appReducer = combineReducers({
    auth,
    label,
    group,
    user,
    annoTask,
    mia,
    worker,
    form: formReducer,
    pipelineRunning,
    pipelineStart
})


const rootReducer = (state, action) => {
    if (action.type === 'USER_LOGOUT') {
        state = undefined
    }

    return appReducer(state, action)
}

  export default rootReducer