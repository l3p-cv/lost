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
        strokeWidth: 4,
        annoDetails:{
            visible: false
        },
        labelInfo:{
            visible: false
        }
    },
    showSingleAnno: undefined,
    selectedTool: undefined,
    showLabelInput: false,
    possibleLabels: [],
    getNextImage: undefined,
    getPrevImage: undefined,
    fullscreenMode: false,
    imageLoaded: false,
    requestAnnoUpdate: 0,
    appliedFullscreen: false,
    layoutUpdate: 0,
    imgBar : {
        show: true
    },
    svg : undefined,
    config : {
        tools: {
            point: true,
            line: true,
            polygon: true,
            bbox: true
        },
        multilabels: true,
        actions: {
            drawing: true,
            labeling: true,
            edit: {
                label: true,
                bounds: true,
                delete: true
            }
        }
    },
    taskFinished: 0
}

export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case TYPES.GET_SIA_ANNOS:
            return {
                ...state,
                annos: action.payload
            }
        case TYPES.GET_SIA_CONFIG:
            return {
                ...state,
                config: action.payload
            }
        case TYPES.SIA_SELECT_ANNO:
            if (action.payload){
                return {
                    ...state,
                    selectedAnno: {...action.payload}
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
        case TYPES.SIA_GET_NEXT_IMAGE:
            return {
                ...state,
                getNextImage: action.payload,
                getPrevImage: undefined
            }
        case TYPES.SIA_GET_PREV_IMAGE:
            return {
                ...state,
                getPrevImage: action.payload,
                getNextImage: undefined
            }
        case TYPES.SIA_FULLSCREEN:
            return {
                ...state,
                fullscreenMode: action.payload
            }
        case TYPES.SIA_IMAGE_LOADED:
            return {
                ...state,
                imageLoaded: action.payload
            }
        case TYPES.SIA_UPDATE_REDUX_ANNOS:
            return {
                ...state,
                annos: action.payload
            }
        case TYPES.SIA_REQUEST_ANNO_UPDATE:
            return {
                ...state,
                requestAnnoUpdate: state.requestAnnoUpdate + 1
            }
        case TYPES.SIA_APPLIED_FULLSCREEN:
            return {
                ...state,
                appliedFullscreen: action.payload
            }
        case TYPES.SIA_LAYOUT_UPDATE:
            return {
                ...state,
                layoutUpdate: state.layoutUpdate + 1
            }
        case TYPES.SIA_IMGBAR_SHOW:
            return {
                ...state,
                imgBar: {
                    ...state.imgBar,
                    show:action.payload
                }
            }
        case TYPES.SIA_SET_SVG:
            return {
                ...state,
                svg: {
                    ...action.payload
                }
            }
        case TYPES.SIA_TASK_FINISHED:
            return {
                ...state,
                taskFinished: state.taskFinished + 1
            }
        default:
            return state
    }
}