import TYPES from '../types/index'
const INITIAL_STATE = {
    workers: [],
}

export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case TYPES.GET_WORKERS:
            return {
                ...state,
                workers: action.payload.workers,
            }
        default:
            return state
    }
}
