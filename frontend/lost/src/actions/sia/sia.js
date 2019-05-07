import axios from 'axios'
import TYPES from '../../types/index'
import {API_URL} from '../../settings'
import {http} from 'l3p-frontend'

export const getSiaAnnos = (imageId) => async dispatch => {
    try {
        const response = await axios.get(API_URL + '/sia/next/' + imageId)
        dispatch({type: TYPES.GET_SIA_ANNOS, payload: response.data})
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

export const selectAnnotation = (annoId) => {
    return {
        type: TYPES.SIA_SELECT_ANNO,
        payload: {
            annoId
        }
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