import axios from 'axios'
import TYPES from '../../types/index'
import {API_URL} from '../../lost_settings'

axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token')

export const getMiaAnnos = (maxAmount) => async dispatch => {
    try {
        const response = await axios.get(API_URL + '/mia/next/' + maxAmount)
        dispatch({type: TYPES.GET_MIA_ANNOS, payload: response.data})
    } catch (e) {console.log(e)}
}

export const getSpecialMiaAnnos = (miaIds, getWorkingAnnoTask) => async dispatch => {
    try {
        const response = await axios.post(API_URL + '/mia/special', miaIds)
        dispatch({type: TYPES.GET_MIA_ANNOS, payload: response.data})
        getWorkingAnnoTask()
    } catch (e) {console.log(e)}
}

export const getMiaImage = (img) => async dispatch =>{
    try {
        const response = await axios.post(API_URL + '/data/getImage', img)
        return response
    } catch (e) {console.error(e)}
        // const config = {
        //     url: API_URL +'/'+ path,
        //     type: 'image',
        //     token: localStorage.getItem('token')
        // }
        // return await http.get(config)
}

export const miaZoomIn = (zoom) => dispatch =>{
    let newZoom = zoom*= 1.2
    if(newZoom > 400){
        newZoom = 400
    }
    localStorage.setItem('mia-zoom', newZoom)
    dispatch({type: TYPES.MIA_ZOOM, payload: newZoom})
}

export const miaZoomOut = (zoom) => dispatch =>{
    let newZoom = zoom*= 0.8
    if(newZoom < 20){
        newZoom = 20
    }
    localStorage.setItem('mia-zoom', newZoom)
    dispatch({type: TYPES.MIA_ZOOM, payload: newZoom})
}

export const miaAmount = (amount) => dispatch =>{
    localStorage.setItem('mia-max-amount', amount)
    dispatch({type: TYPES.MIA_AMOUNT, payload: amount})
}

export const miaToggleActive = (payload) => dispatch => {
    dispatch({type: TYPES.MIA_TOGGLE_ACTIVE, payload: payload.image})
}

export const getMiaLabel = () => async dispatch => {
    try {
        const response = await axios.get(API_URL + '/mia/label')
        dispatch({type: TYPES.GET_MIA_LABEL, payload: response.data})
    } catch (e) {console.log(e)}
}

export const setMiaSelectedLabel = (label) => dispatch => {
    dispatch({type: TYPES.MIA_SELECT_LABEL, payload: label})
}

export const updateMia = (data, getMiaAnnos, getWorkingAnnoTask, maxAmount) => async dispatch => {
    try {
        await axios.post(API_URL + '/mia/update', data)
        getMiaAnnos(maxAmount)
        getWorkingAnnoTask()
    } catch (e) {console.log(e)}
}

export const finishMia = (callback, getWorkingAnnoTask) => async dispatch => {
    try {
        await axios.get(API_URL + '/mia/finish')
        if(callback){
            callback()
        }
        getWorkingAnnoTask()
    } catch (e) {console.log(e)}
}