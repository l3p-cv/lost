import TYPES from '../types/index'
const INITIAL_STATE = {
    users: [],
    updateUserStatus: {
        status: undefined
    },
    deleteUserStatus: {
        status: undefined
    },
    createMessage: '',
    deleteMessage: '',
    updateMessage: '',
    updateOwnMessage: '',
    ownUser: {
        userName: '',
        email: '',
        firstName: '',
        lastName: '',
        roles: [],
        groups: [],
        version: 'unknown'
    }
}

export default function (state = INITIAL_STATE, action) {
    switch(action.type) {
    case TYPES.UPDATE_USER_STATUS:
        return{
            ...state,
            updateUserStatus: action.payload
        }
    case TYPES.DELETE_USER_STATUS:
        return{
            ...state,
            deleteUserStatus: action.payload
        }
    case TYPES.GET_USERS:
        return {
            ...state,
            users: action.payload.users
        }
    case TYPES.SET_OWN_USER:
        return {
            ...state,
            ownUser: action.payload
        }
    // case TYPES.CREATE_USER_SUCCESS:
    //     return {
    //         ...state,
    //         createMessage: 'success'
    //     }
    // case TYPES.CLEAN_CREATE_USER_MESSAGE:
    //     return {
    //         ...state,
    //         createMessage: ''
    //     }
    // case TYPES.CREATE_USER_FAILED:
    //     return {
    //         ...state,
    //         createMessage: action.payload
    //     }
    // case TYPES.DELETE_USER_SUCCESS:
    //     return {
    //         ...state,
    //         deleteMessage: 'success'
    //     }
    // case TYPES.DELETE_USER_FAILED:
    //     return {
    //         ...state,
    //         deleteMessage: action.payload
    //     }
    // case TYPES.CLEAN_DELETE_USER_MESSAGE:
    //     return {
    //         ...state,
    //         deleteMessage: ''
    //     }
    // case TYPES.UPDATE_USER_SUCCESS:
    //     return {
    //         ...state,
    //         updateMessage: 'success'
    //     }
    // case TYPES.UPDATE_USER_FAILED:
    //     return {
    //         ...state,
    //         updateMessage: action.payload
    //     }
    // case TYPES.CLEAN_UPDATE_USER_MESSAGE:
    //     return {
    //         ...state,
    //         updateMessage: ''
    //     }
    case TYPES.UPDATE_OWN_USER_SUCCESS:
        return {
            ...state,
            updateOwnMessage: 'success'
        }
    case TYPES.UPDATE_OWN_USER_FAILED:
        return {
            ...state,
            updateOwnMessage: action.payload
        }
    // case TYPES.CLEAN_UPDATE_OWN_USER_MESSAGE:
    //     return {
    //         ...state,
    //         updateOwnMessage: ''
    //     }
    default:
        return state
    }
}
