import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import annoTask from './annoTask'
import lost from './lost'
import mia from './mia'
import sia from './sia'
import siaReview from './siaReview'
import worker from './worker'

const appReducer = combineReducers({
    annoTask,
    mia,
    sia,
    worker,
    form: formReducer,
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
