import axios from 'axios'
import TYPES from '../../types'
import { API_URL } from '../../lost_settings'

axios.defaults.headers.common.Authorization = 'Bearer ' + localStorage.getItem('token')

export const setNavbarVisible = (isVisible) => ({
    type: TYPES.SET_NAVBAR_VISIBLE,
    payload: isVisible,
})

export const setSettings = (obj) => ({
    type: TYPES.SET_SETTINGS,
    payload: obj,
})

export const loadSettings = () => async (dispatch) => {
    try {
        const response = await axios.get(API_URL + '/system/settings')
        dispatch({ type: TYPES.SET_SETTINGS, payload: response.data })
    } catch (e) {
        return null
    }
    return null
}

export const setRoles = (roles) => ({
    type: TYPES.SET_ROLES,
    payload: roles,
})

export const getVersion = () => async (dispatch) => {
    try {
        const response = await axios.get(API_URL + '/system/version')
        dispatch({ type: TYPES.SET_VERSION, payload: response.data })
    } catch (e) {
        return null
    }
    return null
}

export const getJupyterLabUrl = () => async (dispatch) => {
    try {
        const response = await axios.get(API_URL + '/system/jupyter')
        dispatch({ type: TYPES.SET_JUPYTER_LAB_URL, payload: response.data })
    } catch (e) {
        return null
    }
    return null
}
