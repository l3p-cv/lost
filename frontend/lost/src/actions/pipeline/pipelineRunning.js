import {API_URL} from '../../settings'
import axios from 'axios'
import TYPES from '../../types/index'

 const verifyTab = (tabId, verified) => {
    return {
        type: 'PIPELINE_RUNNING_VERIFY_TAB',
        payload: {
            tabId, verified
        }
    }
}

 const selectTab = (tabId) => {
    return {
        type: 'PIPELINE_RUNNING_SELECT_TAB',
        payload: {
            tabId
        }
    }
}

 const getPipelines = () => async dispatch =>{
    const response = await axios.get(`${API_URL}/pipeline`)
    dispatch({type: 'PIPELINE_RUNNING_GET_PIPELINES', payload: response.data})
}

 const getPipeline = (id) => async dispatch => {
    const response = await axios.get(`${API_URL}/pipeline/${id}`)
    dispatch({type: 'PIPELINE_RUNNING_GET_PIPELINE', payload: response.data})
}



const reset = () => {
    return {
        type: 'PIPELINE_RUNNNING_RESET',
        payload: null
    }
}

 const toggleModal = (id) => {
    return {
        type: 'PIPELINE_RUNNING_TOGGLE_MODAL',
        payload:{
            id:id
        }
    }
}

export default {verifyTab, selectTab,getPipelines, getPipeline, toggleModal, reset}