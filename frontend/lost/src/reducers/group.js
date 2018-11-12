import TYPES from '../types/index'
const INITIAL_STATE = {
    groups: []
}

export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case TYPES.GET_GROUPS:
            return {
                ...state,
                groups: action.payload.groups
            }
        default:
            return state
    }
}