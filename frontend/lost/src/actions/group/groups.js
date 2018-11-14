import axios from 'axios'
import TYPES from '../../types/index'
import { API_URL } from '../../settings'

import users from '../user/index'

axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token')

export const getGroups = () => async dispatch => {
    try {
        const response = await axios.get(API_URL + '/group')
        dispatch({ type: TYPES.GET_GROUPS, payload: response.data})
    } catch(e){
       
    }
}

export const createGroup = (payload) => async dispatch => {
    try {
    await axios.post(API_URL + '/group', payload)
            dispatch({type: TYPES.CREATE_GROUP_SUCCESS})
    }
    catch(e){
        dispatch({type: TYPES.CREATE_GROUP_FAILED, payload: e.response.data})
    }

}
export const deleteGroup = (payload) => async dispatch => {
    try{
        await axios.delete(API_URL + `/group/${payload}`)
        dispatch({type: TYPES.DELETE_USER_SUCCESS})
        const newGroupList = await axios.get(API_URL + '/group')
        dispatch({type: TYPES.GET_GROUPS, payload: newGroupList.data})
        }    
     catch (e) {
       dispatch({type: TYPES.DELETE_USER_FAILED, payload: e.response.data.message})
   } 
}

export const cleanGroupCreateMessage = () => dispatch => {
dispatch({type: TYPES.CLEAN_GROUP_CREATE_MESSAGE})
}