import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import auth from './auth'
import label from './label'

export default combineReducers({
    auth,
    label,
    form: formReducer
})