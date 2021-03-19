import axios from 'axios'
import TYPES from '../../types/index'
import { API_URL } from '../../lost_settings'
import {
    dispatchRequestError,
    dispatchRequestSuccess,
    dispatchRequestLoading,
    dispatchRequestReset
} from '../dispatchHelper'
axios.defaults.headers.common.Authorization =
    'Bearer ' + localStorage.getItem('token')

export const getGroups = () => async (dispatch) => {
    try {
        const response = await axios.get(API_URL + '/group')
        dispatch({ type: TYPES.GET_GROUPS, payload: response.data })
    } catch (e) {
        return null
    }
    return null
}

export const createGroup = (payload) => async (dispatch) => {
    const REQUEST_STATUS_TYPE = TYPES.CREATE_GROUP_STATUS

    dispatchRequestLoading(dispatch, REQUEST_STATUS_TYPE)
    try {
        await axios.post(API_URL + '/group', payload)
        dispatchRequestSuccess(dispatch, REQUEST_STATUS_TYPE, 'Group added')
    } catch (error) {
        dispatchRequestError(
            dispatch,
            REQUEST_STATUS_TYPE,
            error.message.includes('409')
                ? 'Groupname is already taken'
                : error.message
        )
    }
}

export const deleteGroup = (payload) => async (dispatch) => {
    const TYPE = TYPES.DELETE_GROUP_STATUS
    dispatchRequestLoading(dispatch, TYPE)
    try {
        await axios.delete(API_URL + `/group/${payload}`)
        dispatchRequestSuccess(dispatch, TYPE, 'Group deleted successful')
    } catch (error) {
        dispatchRequestError(dispatch, TYPE, error.message)
    }
    dispatchRequestReset(dispatch, TYPE)
}

// export const deleteGroup = (callback, payload) => async dispatch => {
//     try{
//         await axios.delete(API_URL + `/group/${payload}`)
//         dispatch({type: TYPES.DELETE_GROUP_SUCCESS})
//         const newGroupList = await axios.get(API_URL + '/group')
//         dispatch({type: TYPES.GET_GROUPS, payload: newGroupList.data})
//         callback()
//     } catch (e) {
//         dispatch({type: TYPES.DELETE_GROUP_FAILED,
//             payload: e.response.data.message})
//     }
// }

export const cleanGroupCreateMessage = () => (dispatch) => {
    dispatch({ type: TYPES.CLEAN_GROUP_CREATE_MESSAGE })
}

export const cleanGroupDeleteMessage = () => (dispatch) => {
    dispatch({ type: TYPES.CLEAN_GROUP_DELETE_MESSAGE })
}
