import axios from 'axios'
import TYPES from '../../types/index'
import {API_URL} from '../../lost_settings'




export const getSiaReviewOptions = (pipeElementId) => async dispatch => {
    try {
        const response = await axios.get(API_URL + '/sia/reviewoptions/' + pipeElementId)
        dispatch({type: TYPES.SIA_REVIEW_SET_OPTIONS, payload: response.data})
        // console.log('REQUEST: getSiaReviewOptions: wrongLoad ', response)
    } catch (e) {console.error(e)}
}

export const getSiaReviewAnnos = (data) => async dispatch => {
    try {
        const response = await axios.post(API_URL + '/sia/review', data)
        // console.log('REQUEST: siaReviewAnnos: wrongLoad ', response)
        dispatch({type: TYPES.SIA_REVIEW_SET_ANNOS, payload: response.data})
    } catch (e) {console.error(e)}
}


/**
 * Set PipelineElement to review
 * 
 * @param {int} elementID - ID of the element to review.
 */

export const siaReviewSetElement = (elementID) => {
    return {
        type: TYPES.SIA_REVIEW_SET_ELEMENT,
        payload: elementID
    }
}


export const siaReviewResetAnnos = () => {
    return {
        type: TYPES.SIA_REVIEW_RESET_ANNOS
    }
}

