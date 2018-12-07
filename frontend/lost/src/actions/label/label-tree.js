import axios from 'axios'
import TYPES from '../../types/index'
import { API_URL } from '../../settings'

axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token')

export const getLabelTrees = () => async dispatch => {
    try {
        const response = await axios.get(API_URL + '/label/tree')
        dispatch({ type: TYPES.GET_LABEL_TREES, payload: response.data})
    } catch(e){
       
    }
}

