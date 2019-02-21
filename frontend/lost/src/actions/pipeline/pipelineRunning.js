import {API_URL} from '../../settings'
import axios from 'axios'
import TYPES from '../../types/index'

export const verifyTab = (tabId) => {
    return {
        type: 'VERIFY_TAB',
        payload: tabId
    }
}

export const selectTab = (tabId) => {
    return {
        type: 'SELECT_TAB',
        payload: tabId
    }
}

export const getPipelines = () => async dispatch =>{
    const response = await axios.get(`${API_URL}/pipeline`)
    dispatch({type: 'GET_PIPELINES', payload: response.data})
}
