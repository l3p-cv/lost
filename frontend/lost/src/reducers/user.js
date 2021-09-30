import TYPES from '../types/index'
const INITIAL_STATE = {
    users: [],
    updateUserStatus: {
        status: undefined
    },
    deleteUserStatus: {
        status: undefined
    },
    updateOwnUserStatus: {
        status: undefined,
    },
    createMessage: '',
    deleteMessage: '',
    updateMessage: '',
    updateOwnMessage: '',
    ownUser: {
        user_name: '',
        email: '',
        first_name: '',
        last_name: '',
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
    case TYPES.UPDATE_OWN_USER_STATUS:
        return {
            ...state,
            updateOwnUserStatus: action.payload
        }
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
    default:
        return state
    }
}
