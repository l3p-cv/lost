import axios from 'axios'
import TYPES from '../../types/index'
import { API_URL } from '../../settings'

axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token')

export const getGroups = () => async dispatch => {
    try {
        const response = await axios.get(API_URL + '/group')
        dispatch({ type: TYPES.GET_GROUPS, payload: response.data})
    } catch(e){
       
    }
}

export const createGroup = (payload) => dispatch => {

    axios.post(API_URL + '/group', payload).then(
        response => {
            dispatch({type: TYPES.CREATE_GROUP_SUCCESS})
        }
    ).catch(error => {
        console.log(error.response)
        dispatch({type: TYPES.CREATE_GROUP_FAILED, payload: error.response.data.message})
    })


}

export const cleanGroupError = () => dispatch => {
dispatch({type: TYPES.CLEAN_GROUP_ERROR})
}