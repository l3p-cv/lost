import axios from 'axios'
import TYPES from '../../types/index'
import {API_URL} from '../../settings'

axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token')

export const getUsersAction = () => async dispatch => {
    try {
        const response = await axios.get(API_URL + '/user')
        dispatch({type: TYPES.GET_USERS, payload: response.data})
    } catch (e) {}
}

export const createUser = (payload) => async dispatch => {
    try {
        await axios.post(API_URL + '/user', payload)
        dispatch({type: TYPES.CREATE_USER_SUCCESS})
        const newUserList = await axios.get(API_URL + '/user')
        dispatch({type: TYPES.GET_USERS, payload: newUserList.data})
    } catch (e) {
        dispatch({type: TYPES.CREATE_USER_FAILED, payload: e.response.data.message})
    }

}

export const deleteUser = (payload) => async dispatch => {
    try {
        await axios.delete(API_URL + `/user/${payload}`)
        dispatch({type: TYPES.DELETE_USER_SUCCESS})
        const newUserList = await axios.get(API_URL + '/user')
        dispatch({type: TYPES.GET_USERS, payload: newUserList.data})
    } catch (e) {
        dispatch({type: TYPES.DELETE_USER_FAILED, payload: e.response.data.message})
    }
}
export const cleanCreateUserMessage = () => dispatch => {
    dispatch({type: TYPES.CLEAN_CREATE_USER_MESSAGE})
}

export const cleanDeleteUserMessage = () => dispatch => {
    dispatch({type: TYPES.CLEAN_DELETE_USER_MESSAGE})
}

export const cleanUpdateUserMessage = () => dispatch => {
    dispatch({type: TYPES.CLEAN_UPDATE_USER_MESSAGE})
}

export const cleanUpdateOwnUserMessage = () => dispatch => {
    dispatch({type: TYPES.CLEAN_UPDATE_OWN_USER_MESSAGE})
}

export const updateUser = (payload) => async dispatch => {
    try {
        await axios.patch(API_URL + `/user/${payload.idx}`, payload)
        dispatch({type: TYPES.UPDATE_USER_SUCCESS})
        const newUserList = await axios.get(API_URL + '/user')
        dispatch({type: TYPES.GET_USERS, payload: newUserList.data})
    } catch (e) {
        dispatch({type: TYPES.UPDATE_USER_FAILED, payload: e.response.data})
    }
}

export const getOwnUser = (callback) => async dispatch => {
    try{
        const response = await axios.get(API_URL + '/user/self')
        dispatch({type: TYPES.GET_OWN_USER, payload: response.data})
        callback()
    }
    catch(e) {
    }
}


export const updateOwnUser = (payload) => async dispatch => {
    try {
        await axios.patch(API_URL + `/user/self`, payload)
        dispatch({type: TYPES.UPDATE_OWN_USER_SUCCESS})
        const newOwnUser = await axios.get(API_URL + '/user/self')
        dispatch({type: TYPES.GET_OWN_USER, payload: newOwnUser.data})
    } catch (e) {
        dispatch({type: TYPES.UPDATE_OWN_USER_FAILED, payload: e.response.data})
    }
}