import TYPES from '../types/index'
const INITIAL_STATE = {
    annos: {},
}

export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case TYPES.GET_SIA_ANNOS:
            return {
                ...state,
                annos: action.payload
            }
        default:
            return state
    }
}