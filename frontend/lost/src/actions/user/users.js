import axios from 'axios'
import TYPES from '../../types/index'
import { API_URL } from '../../settings'

axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token')

export const getUsers = () => async dispatch => {
    try {
        const response = await axios.get(API_URL + 'user')
        dispatch({ type: TYPES.GET_USERS, payload: response.data})
    } catch(e){
       
    }
}