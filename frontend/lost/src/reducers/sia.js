import TYPES from '../types/index'
const INITIAL_STATE = {
    annos: {},
    selectedAnno: undefined
}

export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case TYPES.GET_SIA_ANNOS:
            return {
                ...state,
                annos: action.payload
            }
        case TYPES.SIA_SELECT_ANNO:
            return {
                ...state,
                selectedAnno: action.payload.annoId
            }
        default:
            return state
    }
}