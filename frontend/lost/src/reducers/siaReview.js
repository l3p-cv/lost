import TYPES from '../types/index'

const INITIAL_STATE = {
    elementId: null,
    options: null,
    annos: null
}

export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case TYPES.SIA_REVIEW_SET_ELEMENT:
            return {
                ...state,
                elementId: action.payload,
                annos: null
            }
        case TYPES.SIA_REVIEW_SET_OPTIONS:
            return {
                ...state,
                options: {...action.payload}
            }
        case TYPES.SIA_REVIEW_SET_ANNOS:
            return {
                ...state,
                annos: {...action.payload}
            }
        case TYPES.SIA_REVIEW_RESET_ANNOS:
            return {
                ...state,
                annos: null
            }
        default:
            return state
    }
}