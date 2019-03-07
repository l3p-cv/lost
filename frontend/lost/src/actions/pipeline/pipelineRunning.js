import {API_URL} from '../../settings'
import axios from 'axios'
import TYPES from '../../types/index'
console.log('----------API_URLAPI_URL--------------------------');
console.log(API_URL);
console.log('------------------------------------');
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

const deletePipeline = (id) => async dispatch => {
    const response = await axios.delete(`${API_URL}/pipeline/${id}`)
    if(response.data === 'success'){
        if (typeof window !== 'undefined') {
            window.location.href = `${window.location.origin}/dashboard`;
       }
    }
    dispatch({type: 'PIPELINE_RUNNING_DELETE', payload: response.data})
}

const pausePipeline = (id) => async dispatch => {
    const response = await axios.post(`${API_URL}/pipeline/pause/${id}`)
    dispatch({type: 'PIPELINE_RUNNING_PAUSE', payload: response.data})
}

const playPipeline = (id) => async dispatch => {
    const response = await axios.post(`${API_URL}/pipeline/play/${id}`)
    dispatch({type: 'PIPELINE_RUNNING_PLAY', payload: response.data})
}

const regeneratePipeline = (id) => async dispatch => {

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

export default {verifyTab, selectTab,getPipelines, getPipeline, toggleModal, reset, deletePipeline, pausePipeline, playPipeline, regeneratePipeline}