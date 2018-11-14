import TYPES from '../types/index'
const INITIAL_STATE = {
    groups: [],
    errorMessage: '',
}

export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case TYPES.GET_GROUPS:
            return {
                ...state,
                groups: action.payload.groups
            }
        case TYPES.CREATE_GROUP_SUCCESS:
            return {
                ...state,
                errorMessage: 'success'
            }
        case TYPES.CLEAN_GROUP_ERROR:
            return {
                ...state,
                errorMessage: ''
            }
        case TYPES.CREATE_GROUP_FAILED:
            return {
                ...state,
                errorMessage: action.payload
            }
        default:
            return state
    }
}