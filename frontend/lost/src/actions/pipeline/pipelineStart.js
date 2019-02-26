import {API_URL} from '../../settings'
import axios from 'axios'

 const selectTab = (tabId) => {
    return {
        type: 'PIPELINE_START_SELECT_TAB',
        payload: {
            tabId
        }
    }
}






 const verifyTab = (tabId, verified) => {
    return {
        type: 'PIPELINE_START_VERIFY_TAB',
        payload: {
            tabId, verified
        }
    }
}

const selectTabAnnoTask = (tabId, verified, elementId) => {
    return{
        type: 'PIPELINE_START_ANNO_TASK_SELECT_TAB',
        payload: {
            tabId, verified, elementId
        }
    }
}

const verifyTabAnnoTask = (tabId, verified, elementId) =>{
    return{
        type: 'PIPELINE_START_ANNO_TASK_VERIFY_TAB',
        payload: {
            tabId, verified, elementId
        }
    }
}

const getTemplates = () => async dispatch =>{
    const response = await axios.get(`${API_URL}/pipeline/template`)
    dispatch({type: 'PIPELINE_START_GET_TEMPLATES', payload: response.data})
}

 const getTemplate = (id) => async dispatch => {
    const response = await axios.get(`${API_URL}/pipeline/template/${id}`)
    dispatch({type: 'PIPELINE_START_GET_TEMPLATE', payload: response.data})
}


 const toggleModal = (id) => {
    return {
        type: 'PIPELINE_START_TOGGLE_MODAL',
        payload:{
            id:id
        }
    }
}

export default {
    selectTab, 
    getTemplates, 
    verifyTab, 
    getTemplate, 
    toggleModal, 
    selectTabAnnoTask, 
    verifyTabAnnoTask
}