import TYPES from '../types/index'
const INITIAL_STATE = {
    annoTasks: [],
    workingOnAnnoTask: null,
    annoTaskStatistic: null,
}

export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case TYPES.GET_ANNO_TASKS:
            return {
                ...state,
                annoTasks: action.payload,
            }
        case TYPES.GET_WORKING_ON_ANNO_TASK:
            return {
                ...state,
                workingOnAnnoTask: action.payload,
            }
        case TYPES.GET_ANNOTASK_SPECIFIC_STATISTIC:
            return {
                ...state,
                annoTaskStatistic: action.payload,
            }
        default:
            return state
    }
}
