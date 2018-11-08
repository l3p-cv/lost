import axios from 'axios'
import TYPES from '../../types/index'
import { API_URL } from '../../settings'

axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token')

export const getGroups = () => async dispatch => {
    try {
        const response = await axios.get(API_URL + 'group')
        dispatch({ type: TYPES.GET_GROUPS, payload: response.data})
    } catch(e){
       
    }
}