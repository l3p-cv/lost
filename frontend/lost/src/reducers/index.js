import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import annoTask from './annoTask'
import auth from './auth'
import group from './group'
import lost from './lost'
import mia from './mia'
import pipelineRunning from './pipelineRunning'
import pipelineStart from './pipelineStart'
import sia from './sia'
import siaReview from './siaReview'
import user from './user'
import worker from './worker'

const appReducer = combineReducers({
    auth,
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
    lost,
})

const rootReducer = (state, action) => {
    if (action.type === 'logout') {
        state = undefined
    }

    return appReducer(state, action)
}

export default rootReducer
