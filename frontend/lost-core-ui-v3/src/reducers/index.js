import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import auth from './auth'
import label from './label'
import group from './group'
import user from './user'
import annoTask from './annoTask'
import mia from './mia'
import sia from './sia'
import worker from './worker'
import pipelineRunning from './pipelineRunning'
import pipelineStart from './pipelineStart'
import siaReview from './siaReview'
import lost from './lost'

const appReducer = combineReducers({
    auth,
    label,
    group,
    user,
    annoTask,
    mia,
    sia,
    worker,
    form: formReducer,
    pipelineRunning,
    pipelineStart,
    siaReview,
    lost
})


const rootReducer = (state, action) => {
    if (action.type === 'logout') {
        state = undefined
    }

    return appReducer(state, action)
}

  export default rootReducer