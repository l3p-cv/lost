import { API_URL } from '../../settings'
import axios from 'axios'
import TYPES from '../../types/index'
import { http } from 'l3p-frontend'
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


const getPipelines = () => async dispatch => {
    const response = await axios.get(`${API_URL}/pipeline`)
    dispatch({ type: 'PIPELINE_RUNNING_GET_PIPELINES', payload: response.data })
}

const getPipeline = (id) => async dispatch => {
    const response = await axios.get(`${API_URL}/pipeline/${id}`)
    dispatch({ type: 'PIPELINE_RUNNING_GET_PIPELINE', payload: response.data })
}

const deletePipeline = (id) => async dispatch => {
    const response = await axios.delete(`${API_URL}/pipeline/${id}`)
    if (response.data === 'success') {
        if (typeof window !== 'undefined') {
            window.location.href = `${window.location.origin}`;
        }
    }
    dispatch({ type: 'PIPELINE_RUNNING_DELETE', payload: response.data })
}

const pausePipeline = (id) => async dispatch => {
    const response = await axios.post(`${API_URL}/pipeline/pause/${id}`)
    dispatch({ type: 'PIPELINE_RUNNING_PAUSE', payload: response.data })
}

const playPipeline = (id) => async dispatch => {
    const response = await axios.post(`${API_URL}/pipeline/play/${id}`)
    dispatch({ type: 'PIPELINE_RUNNING_PLAY', payload: response.data })
}

const regeneratePipeline = (id) => async dispatch => {

}
const downloadLogfile = (path, id) => async  dispatch => {
    const token = localStorage.getItem('token')
    const response = await http.get({
        url: `${API_URL}/${path}?nocache=${Math.random()}`,
        token,
        type: 'image'
    })
    const objectURL = window.URL.createObjectURL(response)
    const link = document.createElement('a');
    link.href = objectURL;
    link.download=`p-${id}.log`
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(objectURL);
}

const downloadDataExport = (filePath) => async dispatch => {
    const token = localStorage.getItem('token')
    const response = await http.get({
        url: `${API_URL}/${filePath}?nocache=${Math.random()}`,
		token,
		type: 'image'
	})
        // create blob url
        const objectURL = window.URL.createObjectURL(response)
        // simulate click on download button
        const link = document.createElement('a');
        link.href = objectURL;
        link.download= filePath.split('/').pop()
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(objectURL);
}

const downloadImage = (path) => async dispatch => {

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
        payload: {
            id: id
        }
    }
}

export default { verifyTab, selectTab, getPipelines, getPipeline, toggleModal, reset, deletePipeline, pausePipeline, playPipeline, regeneratePipeline, downloadLogfile, downloadDataExport }