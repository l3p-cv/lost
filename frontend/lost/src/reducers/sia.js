import TYPES from '../types/index'
const INITIAL_STATE = {
    annos: {},
    selectedAnno: {
        annoId: undefined,
        anno: undefined,
        type: undefined
    },
    keyUp: undefined,
    keyDown: undefined,
    uiConfig: {
        nodeRadius: 4,
        strokeWidth: 4
    },
    showSingleAnno: undefined,
    selectedTool: undefined,
    showLabelInput: false,
    possibleLabels: []
}

export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case TYPES.GET_SIA_ANNOS:
            return {
                ...state,
                annos: action.payload
            }
        case TYPES.SIA_SELECT_ANNO:
            if (action.payload){
                return {
                    ...state,
                    selectedAnno: {...state.selectedAnno, ...action.payload}
                }
            } else {
                return {
                    ...state,
                    selectedAnno: { id: undefined}
                }
            }
        case TYPES.GET_SIA_LABELS:
            return {
                ...state,
                possibleLabels: [...action.payload]
            }
        case TYPES.SIA_KEY_DOWN:
            return {
                ...state,
                keyDown: action.payload.key,
                keyUp: undefined
            }
        case TYPES.SIA_KEY_UP:
            return {
                ...state,
                keyUp: action.payload.key,
                keyDown: undefined
            }
        case TYPES.SIA_SET_UICONFIG:
            return {
                ...state,
                uiConfig: {...state.uiConfig,...action.payload}
            }
        case TYPES.SIA_SHOW_SINGLE_ANNO:
            return {
                ...state,
                showSingleAnno: action.payload

            }
        case TYPES.SIA_SELECT_TOOL:
            return {
                ...state,
                selectedTool: action.payload

            }
        case TYPES.SIA_SHOW_LABEL_INPUT:
            return {
                ...state,
                showLabelInput: action.payload

            }
        default:
            return state
    }
}