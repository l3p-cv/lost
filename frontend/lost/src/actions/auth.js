import axios from 'axios'
import TYPES from '../types/index'
import { API_URL } from '../settings'
import jwt_decode from 'jwt-decode'

const login = (formProps, callback) => async dispatch => {
    try {
        const response = await axios.post(API_URL + '/user/login', formProps)
        dispatch({ type: TYPES.AUTH_USER, payload: response.data})
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('refreshToken', response.data.refresh_token)
        localStorage.setItem('view', 'Annotator')
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token')
        const decodedToken = jwt_decode(response.data.token)
        if(decodedToken.user_claims.roles.indexOf('Designer') > -1){
            dispatch({ type: TYPES.CHANGE_VIEW, payload: 'Designer'})
            localStorage.setItem('view', 'Designer')
            callback()
        }else{
            dispatch({ type: TYPES.CHANGE_VIEW, payload: 'Annotator'})
            localStorage.setItem('view', 'Annotator')
            callback()
        }
    } catch(e){
        dispatch({ type: TYPES.AUTH_ERR, payload: 'No valid credentials.'})
    }
}

const decodeJwt = (decoded_token, callback) => async dispatch => {
    if (decoded_token !== undefined ){
        dispatch({ type: TYPES.DECODE_JWT, payload: decoded_token})
    }
}

const checkExpireDateCron = () => async dispatch => {
    if(localStorage.getItem('token')){
        const decodedToken = jwt_decode(localStorage.getItem('token'))
        console.log(Date.now()/1000)
        console.log(decodedToken.exp)
        if (decodedToken !== undefined && decodedToken.exp < Date.now() / 1000){
            try{
                axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('refreshToken')
                await axios.post(API_URL + '/user/logout2')
            }
            catch(e){
            }
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('view')
            dispatch({type: TYPES.LOGOUT})
            window.location.replace('/#/timeout')
        }
    }
}

const checkRole = (view, decoded_token) => async dispatch => {
    if (!(decoded_token.user_claims.roles.indexOf(view) > -1)){
        dispatch({ type: TYPES.CHANGE_VIEW, payload: 'Annotator'})
        localStorage.setItem('view', 'Annotator')
    }
}
const changeView = (view, callback) => async dispatch => {
    callback()
    dispatch({ type: TYPES.CHANGE_VIEW, payload: view})
    localStorage.setItem('view', view)
}

const logout = () => async dispatch => {
    await axios.post(API_URL + '/user/logout')
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('refreshToken')
    await axios.post(API_URL + '/user/logout2')
    dispatch({type: TYPES.LOGOUT})
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('view')
}
const refreshToken = () => async dispatch => {
    const decoded_token = jwt_decode(localStorage.getItem('token'))
    const diff = 8
    const compareDate = new Date(Date.now() + diff*60000).getTime()
    if (decoded_token !== undefined && decoded_token.exp < compareDate / 1000){
        try {
            const response = await axios.post(API_URL + '/user/refresh', {}, {
                headers: { Authorization: "Bearer " + localStorage.getItem('refreshToken') }
            })
            dispatch({ type: TYPES.AUTH_USER, payload: response.data})
            localStorage.setItem('token', response.data.token)
            localStorage.setItem('refreshToken', response.data.refresh_token)
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token')
        } catch(e){
            await axios.post(API_URL + '/user/logout')
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('refreshToken')
            await axios.post(API_URL + '/user/logout2')
            dispatch({type: TYPES.LOGOUT})
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('view')
            window.location.replace('/#/timeout')
        }
    }
}
export default {
    login,
    logout, 
    decodeJwt,
    checkExpireDateCron,
    checkRole,
    changeView,
    refreshToken
}