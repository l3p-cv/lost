import TYPES from '../types/index'

const INITIAL_STATE = {
    elementId: null
}

export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case TYPES.SIA_REVIEW_SET_ELEMENT:
            return {
                ...state,
                elementId: action.payload
            }
        default:
            return state
    }
}