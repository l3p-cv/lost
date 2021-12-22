import axios from 'axios'
import TYPES from '../../types'
import { API_URL } from '../../lost_settings'

export const getAnnoTasks = () => async (dispatch) => {
    try {
        const response = await axios.get(API_URL + '/annotask')
        dispatch({ type: TYPES.GET_ANNO_TASKS, payload: response.data })
    } catch (e) {}
}
export const getWorkingOnAnnoTask = () => async (dispatch) => {
    try {
        const response = await axios.get(API_URL + '/annotask/working')
        dispatch({ type: TYPES.GET_WORKING_ON_ANNO_TASK, payload: response.data })
    } catch (e) {}
}

export const chooseAnnoTask = (id, callBack) => async (dispatch) => {
    try {
        await axios.post(API_URL + '/annotask', { id })

        callBack()
    } catch (e) {}
}

export const forceAnnotationRelease = (id, callBack) => async (dispatch) => {
    try {
        await axios.get(API_URL + `/annotask/force_release/${id}`)

        callBack()
    } catch (e) {}
}

export const getAnnoTaskStatistic = (id) => async (dispatch) => {
    try {
        const response = await axios.get(API_URL + `/annotask/statistic/${id}`)
        dispatch({ type: TYPES.GET_ANNOTASK_SPECIFIC_STATISTIC, payload: response.data })
    } catch (e) {}
}

export const changeUser = (annotaskId, groupId, callBack) => async (dispatch) => {
    try {
        await axios.get(API_URL + `/annotask/change_user/${annotaskId}/${groupId}`)
        callBack()
    } catch (e) {}
}
