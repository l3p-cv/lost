import { API_URL } from '../../lost_settings'
import axios from 'axios'
import {
    alertLoading,
    alertClose,
    alertError,
} from '../../containers/pipeline//globalComponents/Sweetalert'
import types from '../../types'

const selectTab = (tabId) => {
    return {
        type: 'PIPELINE_START_SELECT_TAB',
        payload: {
            tabId,
        },
    }
}

const verifyTab = (tabId, verified) => {
    return {
        type: 'PIPELINE_START_VERIFY_TAB',
        payload: {
            tabId,
            verified,
        },
    }
}

// TAB0

const getTemplates = (visLevel) => async (dispatch) => {
    let response = {}
    let error
    alertLoading()
    try {
        response = await axios.get(`${API_URL}/pipeline/template/${visLevel}`)
    } catch (err) {
        error = err.message
    }
    if (error) {
        alertError(error)
    }
    alertClose()

    dispatch({
        type: types.PIPELINE_START_GET_TEMPLATES,
        payload: {
            response: response.data,
            error: error,
        },
    })
}

// TAB1

const getTemplate = (id) => async (dispatch) => {
    const response = await axios.get(`${API_URL}/pipeline/template/${id}`)
    dispatch({
        type: 'PIPELINE_START_GET_TEMPLATE',
        payload: {
            response: response.data,
            templateId: id,
        },
    })
}

const toggleModal = (id) => {
    return {
        type: 'PIPELINE_START_TOGGLE_MODAL',
        payload: {
            id,
        },
    }
}

const verifyNode = (elementId, verified) => {
    return {
        type: 'PIPELINE_START_VERIFY_NODE',
        payload: {
            elementId,
            verified,
        },
    }
}

// TAB2
const nameOnInput = (value) => {
    return {
        type: 'PIPELINE_START_NAME_INPUT',
        payload: {
            value,
        },
    }
}
const descriptionOnInput = (value) => {
    return {
        type: 'PIPELINE_START_DESCRIPTION_INPUT',
        payload: {
            value,
        },
    }
}

//TAB3

const postPipeline = (data) => async (dispatch) => {
    let response
    try {
        response = await axios({
            method: 'post',
            url: `${API_URL}/pipeline/start`,
            data: data,
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (e) {
        response = e
    }
    dispatch({ type: 'PIPELINE_START_POST_PIPE', payload: response })
}

export default {
    selectTab,
    getTemplates,
    verifyTab,
    getTemplate,
    toggleModal,
    verifyNode,
    nameOnInput,
    descriptionOnInput,
    postPipeline,
}
