import * as REQUEST_STATUS from '../types/requestStatus'
export const dispatchRequestLoading = (dispatch, type, message) =>{
    dispatch({
        type,
        payload: {
            status: REQUEST_STATUS.LOADING,
            message: message ? message : 'Loading'
        }})
}
export const dispatchRequestSuccess = (dispatch, type, message) =>{
    dispatch({
        type,
        payload: {
            status: REQUEST_STATUS.SUCCESS,
            message: message
        } })
}

export const dispatchRequestError = (dispatch, type, message) =>{
    dispatch({type,
        payload:
            {
                status: REQUEST_STATUS.FAILED,
                message
            }})
}


export const dispatchRequestReset = (dispatch, type) =>{
    dispatch({
        type,
        payload:
        {
            status: undefined
        }
    })
}
