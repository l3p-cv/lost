import TYPES from '../types/index'
const INITIAL_STATE = {
    groups: [],
    createGroupStatus: {
        status: undefined
    },
    deleteGroupStatus: {
        status: undefined
    }
}

export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
    case TYPES.GET_GROUPS:
        return {
            ...state,
            groups: action.payload.groups

        }
    case TYPES.CREATE_GROUP_STATUS:
        return {
            ...state,
            createGroupStatus: action.payload
        }
    case TYPES.DELETE_GROUP_STATUS:
        return {
            ...state,
            deleteGroupStatus: action.payload
        }
    default:
        return state
    }
}
