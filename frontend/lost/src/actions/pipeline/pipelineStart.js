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

 const getTemplates = () => async dispatch =>{
    const response = await axios.get(`${API_URL}/pipeline/template`)
    dispatch({type: 'PIPELINE_START_GET_TEMPLATES', payload: response.data})
}




 const verifyTab = (tabId, verified) => {
    return {
        type: 'PIPELINE_START_VERIFY_TAB',
        payload: {
            tabId, verified
        }
    }
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

export default {selectTab, getTemplates, verifyTab, getTemplate, toggleModal}