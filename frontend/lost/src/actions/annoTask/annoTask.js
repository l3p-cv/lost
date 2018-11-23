import axios from 'axios'
import TYPES from '../../types/index'
import { API_URL } from '../../settings'

axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token')

export const getAnnoTasks = () => async dispatch => {
    try {
        const response = await axios.get(API_URL + '/annotask')
        dispatch({ type: TYPES.GET_ANNO_TASKS, payload: response.data})
    } catch(e){
       
    }
}
export const getWorkingOnAnnoTask = () => async dispatch => {
    try {
        const response = await axios.get(API_URL + '/annotask/working')
        dispatch({ type: TYPES.GET_WORKING_ON_ANNO_TASK, payload: response.data})
    } catch(e){
       
    }
}

