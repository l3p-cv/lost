import axios from 'axios'
import TYPES from '../../types/index'
import { API_URL } from '../../lost_settings'
import {
    dispatchRequestError,
    dispatchRequestLoading,
    dispatchRequestSuccess,
    dispatchRequestReset
} from '../dispatchHelper'

axios.defaults.headers.common.Authorization =
    'Bearer ' + localStorage.getItem('token')

export const getUsers = () => async (dispatch) => {
    try {
        const response = await axios.get(API_URL + '/user')
        dispatch({ type: TYPES.GET_USERS, payload: response.data })
    } catch (e) {
        return null
    }
    return null
}

export const createUser = (payload) => async (dispatch) => {
    const TYPE = TYPES.UPDATE_USER_STATUS
    dispatchRequestLoading(dispatch, TYPE)
    try {
        await axios.post(API_URL + '/user', payload)
        dispatchRequestSuccess(dispatch, TYPE, 'User created successfully')
    } catch (e) {
        dispatchRequestError(dispatch, TYPE, e.message)
    }
    dispatchRequestReset(dispatch, TYPE)
}

export const deleteUser = (payload) => async (dispatch) => {
    const TYPE = TYPES.DELETE_USER_STATUS
    dispatchRequestLoading(dispatch, TYPE)
    try {
        await axios.delete(API_URL + `/user/${payload}`)
        dispatchRequestSuccess(dispatch, TYPE, 'User deleted successfully')
    } catch (e) {
        dispatchRequestError(dispatch, TYPE, e.message)
    }
    dispatchRequestReset(dispatch, TYPE)
}

export const updateUser = (payload) => async (dispatch) => {
    const TYPE = TYPES.UPDATE_USER_STATUS
    dispatchRequestLoading(dispatch, TYPE)
    try {
        await axios.patch(API_URL + `/user/${payload.idx}`, payload)
        dispatchRequestSuccess(dispatch, TYPE, 'User updated successfully')
    } catch (e) {
        dispatchRequestError(dispatch, TYPE, e.message)
    }
    dispatchRequestReset(dispatch, TYPE)
}

export const setOwnUser = () => async (dispatch) => {
    try {
        const response = await axios.get(API_URL + '/user/self')
        dispatch({ type: TYPES.SET_OWN_USER, payload: response.data })
    } catch (e) {
        return null
    }
    return null
}


export const updateOwnUser = (payload) => async (dispatch) => {
    const TYPE = TYPES.UPDATE_OWN_USER_STATUS
    dispatchRequestLoading(dispatch, TYPE)
    try {
        await axios.patch(API_URL + '/user/self', payload)
        const newOwnUser = await axios.get(API_URL+ '/user/self')
        dispatch({ type: TYPES.SET_OWN_USER, payload: newOwnUser.data })
        dispatchRequestSuccess(dispatch, TYPE, 'User updated successfully')
    } catch (e) {
        dispatchRequestError(dispatch, TYPE, e.message)
    }
    dispatchRequestReset(dispatch, TYPE)
}
