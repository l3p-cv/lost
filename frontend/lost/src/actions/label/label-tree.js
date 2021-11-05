import axios from 'axios'
import TYPES from '../../types/index'
import { API_URL } from '../../lost_settings'

axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token')

export const getLabelTrees = (visLevel) => async (dispatch) => {
    try {
        const response = await axios.get(API_URL + `/label/tree/${visLevel}`)
        dispatch({ type: TYPES.GET_LABEL_TREES, payload: response.data })
    } catch (e) {}
}
