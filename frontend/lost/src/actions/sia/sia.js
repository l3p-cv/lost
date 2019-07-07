import axios from 'axios'
import TYPES from '../../types/index'
import {API_URL} from '../../settings'
import {http} from 'l3p-frontend'

export const getSiaAnnos = (imageId, type='next') => async dispatch => {
    try {
        const response = await axios.get(API_URL + '/sia/' + type + '/' + imageId)
        dispatch({type: TYPES.GET_SIA_ANNOS, payload: response.data})
    } catch (e) {console.log(e)}
}

export const siaUpdateAnnos = (data) => async dispatch => {
    try {
        const response = await axios.post(API_URL + '/sia/update', data)
    } catch (e) {console.error(e)}
}

export const getSiaLabels = () => async dispatch => {
    try {
        const response = await axios.get(API_URL + '/sia/label')
        dispatch({type: TYPES.GET_SIA_LABELS, payload: response.data.labels})
    } catch (e) {console.log(e)}
}

export const getSiaImage = (path) => async dispatch =>{
  
    const config = {
        url: API_URL +'/'+ path,
        type: 'image',
        token: localStorage.getItem('token')
    }
    return await http.get(config)
}

export const selectAnnotation = (anno) => {
    return {
        type: TYPES.SIA_SELECT_ANNO,
        payload: anno
    }
}

export const siaKeyUp = (key) => {
    return {
        type: TYPES.SIA_KEY_UP,
        payload: {
            key
        }
    }
}

export const siaKeyDown = (key) => {
    return {
        type: TYPES.SIA_KEY_DOWN,
        payload: {
            key
        }
    }
}

export const siaSetUIConfig = (config) => {
    return {
        type: TYPES.SIA_SET_UICONFIG,
        payload: {
            ...config
        }
    }
}

export const siaShowSingleAnno = (annoId) => {
    return {
        type: TYPES.SIA_SHOW_SINGLE_ANNO,
        payload: annoId
    }
}

export const siaSelectTool = (tool) => {
    return {
        type: TYPES.SIA_SELECT_TOOL,
        payload: tool
    }
}

export const siaShowLabelInput = (show) => {
    return {
        type: TYPES.SIA_SHOW_LABEL_INPUT,
        payload: show
    }
}

export const siaGetNextImage = (currentImgId) => {
    return {
        type: TYPES.SIA_GET_NEXT_IMAGE,
        payload: currentImgId
    }
}

export const siaGetPrevImage = (currentImgId) => {
    return {
        type: TYPES.SIA_GET_PREV_IMAGE,
        payload: currentImgId
    }
}

export const siaSetFullscreen = (fullscreen) => {
    return {
        type: TYPES.SIA_FULLSCREEN,
        payload: fullscreen
    }
}

export const siaSetImageLoaded = (loaded) => {
    return {
        type: TYPES.SIA_IMAGE_LOADED,
        payload: loaded
    }
}