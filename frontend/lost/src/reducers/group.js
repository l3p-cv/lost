import TYPES from '../types/index'
const INITIAL_STATE = {
    groups: [],
    createMessage: '',
    deleteMessage: '',
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
                createMessage: 'success'
            }
        case TYPES.CLEAN_GROUP_CREATE_MESSAGE:
            return {
                ...state,
                createMessage: ''
            }
        case TYPES.CREATE_GROUP_FAILED:
            return {
                ...state,
                createMessage: action.payload
            }
        case TYPES.DELETE_GROUP_SUCCESS:
            return {
                ...state,
                deleteMessage: 'success'
            }
        case TYPES.DELETE_GROUP_FAILED:
            return {
                ...state,
                deleteMessage: action.payload
            }
        case TYPES.CLEAN_GROUP_DELETE_MESSAGE:
            return {
                ...state,
                deleteMessage: ''
            }
        default:
            return state
    }
}