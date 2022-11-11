import axios from 'axios'
import TYPES from '../../types/index'
import { API_URL } from '../../lost_settings'

export const getSiaAnnos =
    (imageId, type = 'next') =>
    async (dispatch) => {
        try {
            const response = await axios.get(API_URL + '/sia/' + type + '/' + imageId)
            dispatch({ type: TYPES.GET_SIA_ANNOS, payload: response.data })
            // console.log('REQUEST: getSiaAnnos: ', response)
        } catch (e) {
            console.error(e)
        }
    }

export const siaUpdateAnnos =
    (data, isAutoSave = false) =>
    async (dispatch) => {
        const sendData = { ...data, isAutoSave }
        try {
            const response = await axios.post(API_URL + '/sia/update', sendData)
            // console.log('REQUEST: siaUpdateAnnos: wrongLoad ', response)
            return response
        } catch (e) {
            console.error(e)
            return 'error'
        }
    }

export const siaUpdateOneThing =
    (data) =>
    async (dispatch) => {
        const sendData = { ...data}
        try {
            const response = await axios.post(API_URL + '/sia/updateOneThing', sendData)
            // console.log('REQUEST: siaUpdateAnnos: wrongLoad ', response)
            return response
        } catch (e) {
            console.error(e)
            return 'error'
        }
    }

export const siaGetNextAnnoId = () => async (dispatch) => {
    try {
        const response = await axios.get(API_URL + '/sia/nextAnnoId')
        // console.log('SIA REQUEST: ', response)
        return response
    } catch (e) {
        console.error(e)
    }
}

export const siaAllowedToMarkExample = () => async (dispatch) => {
    try {
        const response = await axios.get(API_URL + '/sia/allowedExampler')
        // console.log('SIA REQUEST: ', response)
        return response
    } catch (e) {
        console.error(e)
    }
}

export const getSiaImage = (imgId) => async (dispatch) => {
    try {
        const response = await axios.post(API_URL + '/data/getImage', {
            type: 'imageBased',
            id: imgId,
        })
        // const response = await axios.post(API_URL + '/sia/getimage', {imgId:imgId})
        // console.log('REQUEST: sia/getimage response: ', response)
        return response
    } catch (e) {
        console.error(e)
    }
    // console.log(path)
    // const config = {
    //     url: API_URL + path,
    //     type: 'image',
    //     token: localStorage.getItem('token')
    // }
    // return await http.get(config)
}

export const siaFilterImage = (data) => async (dispatch) => {
    try {
        const response = await axios.post(API_URL + '/sia/filter', data)
        // console.log('REQUEST: sia/filter response: ', response)
        return response
    } catch (e) {
        console.error(e)
    }
}

export const siaApplyFilter = (filter) => {
    return {
        type: TYPES.SIA_APPLY_FILTER,
        payload: filter,
    }
}

/**
 * Set annotation task in backend to finished
 */
export const siaSendFinishToBackend = () => async (dispatch) => {
    try {
        const response = await axios.get(API_URL + '/sia/finish')
        return response
    } catch (e) {
        console.error(e)
    }
}

export const getSiaLabels = () => async (dispatch) => {
    try {
        const response = await axios.get(API_URL + '/sia/label')
        dispatch({ type: TYPES.GET_SIA_LABELS, payload: response.data.labels })
    } catch (e) {
        console.log(e)
    }
}

export const getSiaConfig = () => async (dispatch) => {
    try {
        const response = await axios.get(API_URL + '/sia/configuration')
        dispatch({ type: TYPES.GET_SIA_CONFIG, payload: response.data })
    } catch (e) {
        console.log(e)
    }
}

export const selectAnnotation = (anno) => {
    return {
        type: TYPES.SIA_SELECT_ANNO,
        payload: anno,
    }
}

export const siaKeyUp = (key) => {
    return {
        type: TYPES.SIA_KEY_UP,
        payload: {
            key,
        },
    }
}

export const siaKeyDown = (key) => {
    return {
        type: TYPES.SIA_KEY_DOWN,
        payload: {
            key,
        },
    }
}

export const siaSetUIConfig = (config) => {
    localStorage.setItem('sia-ui-config', JSON.stringify(config))
    return {
        type: TYPES.SIA_SET_UICONFIG,
        payload: {
            ...config,
        },
    }
}

export const siaShowSingleAnno = (annoId) => {
    return {
        type: TYPES.SIA_SHOW_SINGLE_ANNO,
        payload: annoId,
    }
}

export const siaSelectTool = (tool) => {
    return {
        type: TYPES.SIA_SELECT_TOOL,
        payload: tool,
    }
}

export const siaShowLabelInput = (show) => {
    return {
        type: TYPES.SIA_SHOW_LABEL_INPUT,
        payload: show,
    }
}

export const siaGetNextImage = (currentImgId) => {
    return {
        type: TYPES.SIA_GET_NEXT_IMAGE,
        payload: currentImgId,
    }
}

export const siaGetPrevImage = (currentImgId) => {
    return {
        type: TYPES.SIA_GET_PREV_IMAGE,
        payload: currentImgId,
    }
}

export const siaSetFullscreen = (fullscreen) => {
    return {
        type: TYPES.SIA_FULLSCREEN,
        payload: fullscreen,
    }
}

export const siaSetImageLoaded = (loaded) => {
    return {
        type: TYPES.SIA_IMAGE_LOADED,
        payload: loaded,
    }
}

export const siaUpdateReduxAnnos = (annos) => {
    return {
        type: TYPES.SIA_UPDATE_REDUX_ANNOS,
        payload: annos,
    }
}

export const siaRequestAnnoUpdate = (annos) => {
    return {
        type: TYPES.SIA_REQUEST_ANNO_UPDATE,
    }
}

export const siaAppliedFullscreen = (appliedFullscreen) => {
    return {
        type: TYPES.SIA_APPLIED_FULLSCREEN,
        payload: appliedFullscreen,
    }
}

export const siaLayoutUpdate = (annos) => {
    return {
        type: TYPES.SIA_LAYOUT_UPDATE,
    }
}

export const siaShowImgLabelInput = (show) => {
    return {
        type: TYPES.SIA_IMGLABELINPUT_SHOW,
        payload: show,
    }
}

export const siaSetSVG = (svg) => {
    return {
        type: TYPES.SIA_SET_SVG,
        payload: svg,
    }
}

/**
 * Finish current sia task
 */
export const siaSetTaskFinished = () => {
    return {
        type: TYPES.SIA_TASK_FINISHED,
    }
}

/**
 * Mark image as junk
 *
 * @param {bool} junk - Junk or not.
 */
export const siaImgIsJunk = (junk) => {
    return {
        type: TYPES.SIA_IMG_JUNK,
        payload: junk,
    }
}
