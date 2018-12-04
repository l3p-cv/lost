import TYPES from '../types/index'
const INITIAL_STATE = {
    annoTasks: [],
    workingOnAnnoTask: null,
}

export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case TYPES.GET_ANNO_TASKS:
            return {
                ...state,
                annoTasks: action.payload

            }
        case TYPES.GET_WORKING_ON_ANNO_TASK:
            return {
                ...state,
                workingOnAnnoTask: action.payload
            }
        default:
            return state
    }
}