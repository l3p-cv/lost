import axios from 'axios'
import TYPES from '../../types/index'
import {API_URL} from '../../settings'

axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token')

export const getUsers = () => async dispatch => {
    try {
        const response = await axios.get(API_URL + '/user')
        dispatch({type: TYPES.GET_USERS, payload: response.data})
        
    } catch (e) {}
}

export const createUser = (payload) => dispatch => {

        axios.post(API_URL + '/user', payload).then(
            response => {
                dispatch({type: TYPES.CREATE_USER_SUCCESS})
            }
        ).catch(error => {
            console.log(error.response)
            dispatch({type: TYPES.CREATE_USER_FAILED, payload: error.response.data.message})
        })
  
    
}

export const cleanError = () => dispatch => {
    dispatch({type: TYPES.CLEAN_USER_ERROR})
}