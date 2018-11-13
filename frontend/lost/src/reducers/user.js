import TYPES from '../types/index'
const INITIAL_STATE = {
    users: [],
    createError: ''
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
                createError: 'success'
            }
        case TYPES.CLEAN_ERROR:
            return {
                ...state,
                createError: ''
            }
        case TYPES.CREATE_USER_FAILED:
            return {
                ...state,
                createError: action.payload
            }
        default:
            return state
    }
}