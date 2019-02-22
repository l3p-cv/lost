import {API_URL} from '../../settings'
import axios from 'axios'

export const pipelineStartSelectTab = (tabId) => {
    return {
        type: 'START_PIPE_SELECT_TAB',
        payload: {
            tabId
        }
    }
}

export const pipelineStartGetTemplates = () => async dispatch =>{
    const response = await axios.get(`${API_URL}/pipeline/template`)
    dispatch({type: 'START_PIPE_GET_TEMPLATES', payload: response.data})
}




export const pipelineStartVerifyTab = (tabId, verified) => {
    return {
        type: 'START_PIPE_VERIFY_TAB',
        payload: {
            tabId, verified
        }
    }
}
