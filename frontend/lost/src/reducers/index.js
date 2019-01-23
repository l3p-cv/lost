import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import auth from './auth'
import label from './label'
import group from './group'
import user from './user'
import annoTask from './annoTask'
import mia from './mia'

export default combineReducers({
    auth,
    label,
    group,
    user,
    annoTask,
    mia,
    form: formReducer
})