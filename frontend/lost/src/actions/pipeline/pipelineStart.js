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

// TAB0

const getTemplates = () => async dispatch =>{
    const response = await axios.get(`${API_URL}/pipeline/template`)
    dispatch({type: 'PIPELINE_START_GET_TEMPLATES', payload: response.data})
}

// TAB1

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

const verifyNode = (elementId, verified) => {
    return {
        type: 'PIPELINE_START_VERIFY_NODE',
        payload: {
            elementId, verified
        }
    }
}

// TAB2
const nameOnInput = (value) => {
    return {
        type: 'PIPELINE_START_NAME_INPUT',
        payload: {
            value
        }
    }
}
const descriptionOnInput = (value) => {
    return {
        type: 'PIPELINE_START_DESCRIPTION_INPUT',
        payload: {
            value
        }
    }
}

//TAB3



export default {
    selectTab, 
    getTemplates, 
    verifyTab, 
    getTemplate, 
    toggleModal, 
    verifyNode,
    nameOnInput,
    descriptionOnInput
}
