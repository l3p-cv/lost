import TYPES from '../types/index'
const INITIAL_STATE = {
    users: []
}

export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case TYPES.GET_USERS:
            return {
                ...state,
                users: action.payload.users
            }
        default:
            return state
    }
}