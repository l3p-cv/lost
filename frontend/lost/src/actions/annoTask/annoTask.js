import axios from 'axios'
import TYPES from '../../types'
import { API_URL } from '../../lost_settings'

export const getAnnoTasks = () => async (dispatch) => {
  try {
    const response = await axios.get(API_URL + '/annotasks')
    dispatch({ type: TYPES.GET_ANNO_TASKS, payload: response.data.annoTasks })
  } catch (e) {}
}
export const getWorkingOnAnnoTask = () => async (dispatch) => {
  try {
    const response = await axios.get(API_URL + '/annotasks/working')
    dispatch({ type: TYPES.GET_WORKING_ON_ANNO_TASK, payload: response.data })
  } catch (e) {}
}

export const chooseAnnoTask = (id, callBack) => async (dispatch) => {
  try {
    await axios.post(API_URL + '/annotasks', { id })

    callBack()
  } catch (e) {}
}

export const forceAnnotationRelease = (id, callBack) => async (dispatch) => {
  try {
    await axios.post(API_URL + `/annotasks/${id}/force_release`)

    callBack()
  } catch (e) {}
}

export const getAnnoTaskStatistic = (id) => async (dispatch) => {
  try {
    const response = await axios.get(API_URL + `/annotasks/${id}?statistics=true`)
    dispatch({ type: TYPES.GET_ANNOTASK_SPECIFIC_STATISTIC, payload: response.data })
  } catch (e) {}
}

export const changeUser = (annotaskId, groupId, callBack) => async (dispatch) => {
  try {
    await axios.patch(API_URL + `/annotasks/${annotaskId}/group`, { groupId })
    callBack()
  } catch (e) {}
}
