import TYPES from '../types/index'
const INITIAL_STATE = {
    images: [],
    maxAmount: 10,
    zoom: 100,
}

export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case TYPES.GET_MIA_ANNOS:
            return {
                ...state,
                images: action.payload.images
            }
        case TYPES.MIA_ZOOM:
            return {
                ...state,
                zoom: action.payload
            }
        case TYPES.MIA_AMOUNT:
            return {
                ...state,
                maxAmount: action.payload
            }
        default:
            return state
    }
}