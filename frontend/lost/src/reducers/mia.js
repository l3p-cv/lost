import TYPES from '../types/index'
const INITIAL_STATE = {
    images: [],
    maxAmount: 10
}

export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case TYPES.GET_MIA_ANNOS:
            return {
                ...state,
                images: action.payload.images
            }
        default:
            return state
    }
}