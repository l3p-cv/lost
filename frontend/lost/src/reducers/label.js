import TYPES from '../types/index'
const INITIAL_STATE = {
    trees: []
}

export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case TYPES.GET_LABEL_TREES:
            return {
                ...state,
                trees: action.payload
            }
        default:
            return state
    }
}