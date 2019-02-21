import {API_URL} from '../../settings'
import axios from 'axios'
import TYPES from '../../types/index'

export const verifyTab = (tabId, verified) => {
    return {
        type: 'VERIFY_TAB',
        payload: {
            tabId, verified
        }
    }
}

export const selectTab = (tabId) => {
    return {
        type: 'SELECT_TAB',
        payload: {
            tabId
        }
    }
}

export const getPipelines = () => async dispatch =>{
    const response = await axios.get(`${API_URL}/pipeline`)
    dispatch({type: 'GET_PIPELINES', payload: response.data})
}

export const getPipeline = (id) => async dispatch => {
    const response = await axios.get(`${API_URL}/pipeline/${id}`)
    dispatch({type: 'GET_PIPELINE', payload: response.data})
}
