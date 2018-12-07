import axios from 'axios'
import TYPES from '../../types/index'
import { API_URL } from '../../settings'

axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token')

export const updateLabel = (data) => async dispatch => {
    try {
        const response = await axios.patch(API_URL + '/label', data)
        dispatch({ type: TYPES.UPDATE_LABEL_SUCCESS, payload: response.data})
        const newLabelTrees = await axios.get(API_URL + '/label/tree')
        dispatch({ type: TYPES.GET_LABEL_TREES, payload: newLabelTrees.data})
    } catch(e){
        console.log(data)
        console.log(e)
        dispatch({ type: TYPES.UPDATE_LABEL_FAILED, payload: e.response.data.message})
    }
}
export const createLabel = (data) => async dispatch => {
    try {
        const response = await axios.post(API_URL + '/label', data)
        dispatch({ type: TYPES.CREATE_LABEL_SUCCESS, payload: response.data})
        const newLabelTrees = await axios.get(API_URL + '/label/tree')
        dispatch({ type: TYPES.GET_LABEL_TREES, payload: newLabelTrees.data})
    } catch(e){
        dispatch({ type: TYPES.CREATE_LABEL_FAILED, payload: e.response.data.message})
    }
}
export const createLabelTree = (data) => async dispatch => {
    try {
        const response = await axios.post(API_URL + '/label', data)
        dispatch({ type: TYPES.CREATE_LABEL_TREE_SUCCESS, payload: response.data})
        const newLabelTrees = await axios.get(API_URL + '/label/tree')
        dispatch({ type: TYPES.GET_LABEL_TREES, payload: newLabelTrees.data})
    } catch(e){
        dispatch({ type: TYPES.CREATE_LABEL_TREE_FAILED, payload: e.response.data.message})
    }
}

export const deleteLabel = (data) => async dispatch => {
    try {
        const response = await axios.delete(API_URL + `/label/${data.id}`)
        dispatch({ type: TYPES.DELETE_LABEL_SUCCESS, payload: response.data})
        const newLabelTrees = await axios.get(API_URL + '/label/tree')
        dispatch({ type: TYPES.GET_LABEL_TREES, payload: newLabelTrees.data})
    } catch(e){
        dispatch({ type: TYPES.DELETE_LABEL_FAILED, payload: e.response.data.message})
    }
}

export const cleanLabelMessages = () => dispatch => {
    dispatch({type: TYPES.CLEAN_LABEL_MESSAGES})
    }
    