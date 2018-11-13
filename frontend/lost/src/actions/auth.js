import axios from 'axios'
import TYPES from '../types/index'
import { API_URL } from '../settings'

//axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token')

const login = (formProps, callback) => async dispatch => {
    try {
        const response = await axios.post(API_URL + 'user/login', formProps)
        dispatch({ type: TYPES.AUTH_USER, payload: response.data})
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('refreshToken', response.data.refresh_token)
        localStorage.setItem('view', 'Annotater')
        callback()
    } catch(e){
        dispatch({ type: TYPES.AUTH_ERR, payload: 'No valid credentials.'})
    }
}

const decodeJwt = (decoded_token, callback) => async dispatch => {
    if (decoded_token !== undefined ){
        dispatch({ type: TYPES.DECODE_JWT, payload: decoded_token})
    }
}
const checkExpireDate = (decoded_token, callback) => async dispatch => {
    if (decoded_token !== undefined && decoded_token.exp < Date.now() / 1000){
        dispatch({type: TYPES.LOGOUT})
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('view')
        callback()
    }
}

const checkRole = (view, decoded_token) => async dispatch => {
    if (!(decoded_token.user_claims.roles.indexOf(view) > -1)){
        dispatch({ type: TYPES.CHANGE_VIEW, payload: 'Annotater'})
        localStorage.setItem('view', 'Annotater')
    }
}
const changeView = (view, callback) => async dispatch => {
    callback()
    dispatch({ type: TYPES.CHANGE_VIEW, payload: view})
    localStorage.setItem('view', view)
}

export default {
    login,
    decodeJwt,
    checkExpireDate,
    checkRole,
    changeView,
}