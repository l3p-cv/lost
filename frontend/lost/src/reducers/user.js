import TYPES from '../types/index'
const INITIAL_STATE = {
    users: [],
    errorMessage: '',
}

export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case TYPES.GET_USERS:
            return {
                ...state,
                users: action.payload.users
            }
        case TYPES.CREATE_USER_SUCCESS:
            return {
                ...state,
                errorMessage: 'success'
            }
        case TYPES.CLEAN_USER_ERROR:
            return {
                ...state,
                errorMessage: ''
            }
        case TYPES.CREATE_USER_FAILED:
            return {
                ...state,
                errorMessage: action.payload
            }
        default:
            return state
    }
}