import { API_URL } from '../../lost_settings'
import axios from 'axios'
import TYPES from '../../types/index'
import { http } from 'l3p-frontend'
import {
    dispatchRequestLoading,
    dispatchRequestReset,
    dispatchRequestError,
} from '../dispatchHelper'
import REQUEST_STATUS from '../../types/requestStatus'

const verifyTab = (tabId, verified) => {
    return {
        type: TYPES.PIPELINE_RUNNING_VERIFY_TAB,
        payload: {
            tabId,
            verified,
        },
    }
}

const selectTab = (tabId) => {
    return {
        type: TYPES.PIPELINE_RUNNING_SELECT_TAB,
        payload: {
            tabId,
        },
    }
}

const getPipelines = () => async (dispatch) => {
    const TYPE = TYPES.PIPELINE_RUNNING_GET_PIPELINES_STATUS
    dispatchRequestLoading(dispatch, TYPE)
    try {
        const response = await axios.get(`${API_URL}/pipeline`)
        dispatch({
            type: TYPES.PIPELINE_RUNNING_GET_PIPELINES,
            payload: {
                response: response.data,
            },
        })
    } catch (err) {
        dispatchRequestError(dispatch, TYPE)
    }
    dispatchRequestReset(dispatch, TYPE)
}

const getPipeline = (id) => async (dispatch) => {
    let response = {}
    try {
        response = await axios.get(`${API_URL}/pipeline/${id}`)
    } catch (err) {
        console.warn(err)
        response.data = 'ERROR'
    }
    dispatch({ type: TYPES.PIPELINE_RUNNING_GET_PIPELINE, payload: response.data })
}

const deletePipeline = (id) => async (dispatch) => {
    const response = await axios.delete(`${API_URL}/pipeline/${id}`)
    if (response.data === 'success') {
        if (typeof window !== 'undefined') {
            window.location.href = `${window.location.origin}`
        }
    }
    dispatch({ type: TYPES.PIPELINE_RUNNING_DELETE, payload: response.data })
}

const pausePipeline = (id) => async (dispatch) => {
    const response = await axios.post(`${API_URL}/pipeline/pause/${id}`)
    dispatch({ type: TYPES.PIPELINE_RUNNING_PAUSE, payload: response.data })
}

const playPipeline = (id) => async (dispatch) => {
    const response = await axios.post(`${API_URL}/pipeline/play/${id}`)
    dispatch({ type: TYPES.PIPELINE_RUNNING_PLAY, payload: response.data })
}

const regeneratePipeline = (id) => async (dispatch) => {}

const getLog = async (id) => {
    let response = {}
    try {
        response = await axios.get(`${API_URL}/data/logs/${id}`)
    } catch (err) {
        console.warn(err)
        response.data = 'ERROR'
    }
    return response.data
}

const updateArguments = (elementId, updatedArguments) => async (dispatch) => {
    dispatch({
        type: TYPES.PIPELINE_RUNNING_UPDATE_ARGUMENTS_REQUEST_STATUS,
        payload: REQUEST_STATUS.LOADING,
    })
    try {
        const response = await axios.post(`${API_URL}/pipeline/updateArguments`, {
            elementId,
            updatedArguments,
        })
        dispatch({
            type: TYPES.PIPELINE_RUNNING_UPDATE_ARGUMENTS_REQUEST_STATUS,
            payload:
                response.status === 200 ? REQUEST_STATUS.SUCCESS : REQUEST_STATUS.FAILED,
        })
    } catch (e) {
        dispatch({
            type: TYPES.PIPELINE_RUNNING_UPDATE_ARGUMENTS_REQUEST_STATUS,
            payload: REQUEST_STATUS.FAILED,
        })
    }

    // const response = await axios.post(`${API_URL}/updateArguments/6`)
}

const downloadLogfile = (id) => async (dispatch) => {
    const token = localStorage.getItem('token')
    const response = await http.get({
        url: `${API_URL}/data/logs/${id}?nocache=${Math.random()}`,
        token,
        type: 'image',
    })
    const objectURL = window.URL.createObjectURL(response)
    const link = document.createElement('a')
    link.href = objectURL
    link.download = `p-${id}.log`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(objectURL)
}

const downloadDataExport = (filePath) => async (dispatch) => {
    const token = localStorage.getItem('token')
    const response = await http.get({
        url: `${API_URL}/${filePath}?nocache=${Math.random()}`,
        token,
        type: 'image',
    })
    // create blob url
    const objectURL = window.URL.createObjectURL(response)
    // simulate click on download button
    const link = document.createElement('a')
    link.href = objectURL
    link.download = filePath.split('/').pop()
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(objectURL)
}

const downloadImage = (filePath) => async (dispatch) => {
    const token = localStorage.getItem('token')
    const response = await http.get({
        url: `${API_URL}/${filePath}`,
        token,
        type: 'image',
    })
    const objectURL = window.URL.createObjectURL(response)
    return objectURL
}

const reset = () => {
    return {
        type: TYPES.PIPELINE_RUNNNING_RESET,
        payload: null,
    }
}

const toggleModal = (id) => {
    return {
        type: TYPES.PIPELINE_RUNNING_TOGGLE_MODAL,
        payload: {
            id: id,
        },
    }
}

export default {
    verifyTab,
    selectTab,
    getPipelines,
    getPipeline,
    toggleModal,
    reset,
    deletePipeline,
    updateArguments,
    pausePipeline,
    playPipeline,
    regeneratePipeline,
    downloadLogfile,
    getLog,
    downloadDataExport,
    downloadImage,
}
