import TYPES from '../types/index'

// import {uiConfig} from '../containers/SIA/lost-sia/src/utils/uiConfig'
import { uiConfig } from '../containers/Annotation/SIA/lost-sia/src/utils/uiConfig'

const INITIAL_STATE = {
    annos: {},
    selectedAnno: {
        annoId: undefined,
        anno: undefined,
        type: undefined,
    },
    keyUp: undefined,
    keyDown: undefined,
    uiConfig: uiConfig,
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
    imgLabelInput: {
        show: false,
    },
    svg: undefined,
    config: {
        tools: {
            point: true,
            line: true,
            polygon: true,
            bbox: true,
            junk: true,
        },
        annos: {
            multilabels: false,
            actions: {
                draw: true,
                label: true,
                edit: true,
            },
            minArea: 500,
        },
        img: {
            multilabels: false,
            actions: {
                label: true,
            },
        },
    },
    taskFinished: 0,
    isJunk: false,
    filter: {
        clahe: { clipLimit: 3.0, active: false },
        rotate: { angle: 0, active: false },
    },
}

export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case TYPES.GET_SIA_ANNOS:
            return {
                ...state,
                annos: action.payload,
            }
        case TYPES.GET_SIA_CONFIG:
            return {
                ...state,
                config: action.payload,
            }
        case TYPES.SIA_APPLY_FILTER:
            return {
                ...state,
                filter: { ...action.payload },
            }
        case TYPES.SIA_SELECT_ANNO:
            if (action.payload) {
                return {
                    ...state,
                    selectedAnno: { ...action.payload },
                }
            } else {
                return {
                    ...state,
                    selectedAnno: { id: undefined },
                }
            }
        case TYPES.GET_SIA_LABELS:
            return {
                ...state,
                possibleLabels: [...action.payload],
            }
        case TYPES.SIA_KEY_DOWN:
            return {
                ...state,
                keyDown: action.payload.key,
                keyUp: undefined,
            }
        case TYPES.SIA_KEY_UP:
            return {
                ...state,
                keyUp: action.payload.key,
                keyDown: undefined,
            }
        case TYPES.SIA_SET_UICONFIG:
            return {
                ...state,
                uiConfig: { ...state.uiConfig, ...action.payload },
            }
        case TYPES.SIA_SHOW_SINGLE_ANNO:
            return {
                ...state,
                showSingleAnno: action.payload,
            }
        case TYPES.SIA_SELECT_TOOL:
            return {
                ...state,
                selectedTool: action.payload,
            }
        case TYPES.SIA_SHOW_LABEL_INPUT:
            return {
                ...state,
                showLabelInput: action.payload,
            }
        case TYPES.SIA_GET_NEXT_IMAGE:
            return {
                ...state,
                getNextImage: action.payload,
                getPrevImage: undefined,
            }
        case TYPES.SIA_GET_PREV_IMAGE:
            return {
                ...state,
                getPrevImage: action.payload,
                getNextImage: undefined,
            }
        case TYPES.SIA_FULLSCREEN:
            return {
                ...state,
                fullscreenMode: action.payload,
            }
        case TYPES.SIA_IMAGE_LOADED:
            return {
                ...state,
                imageLoaded: action.payload,
            }
        case TYPES.SIA_UPDATE_REDUX_ANNOS:
            return {
                ...state,
                annos: action.payload,
            }
        case TYPES.SIA_REQUEST_ANNO_UPDATE:
            return {
                ...state,
                requestAnnoUpdate: state.requestAnnoUpdate + 1,
            }
        case TYPES.SIA_APPLIED_FULLSCREEN:
            return {
                ...state,
                appliedFullscreen: action.payload,
            }
        case TYPES.SIA_LAYOUT_UPDATE:
            return {
                ...state,
                layoutUpdate: state.layoutUpdate + 1,
            }
        case TYPES.SIA_IMGLABELINPUT_SHOW:
            return {
                ...state,
                imgLabelInput: {
                    ...state.imgLabelInput,
                    show: action.payload,
                },
            }
        case TYPES.SIA_SET_SVG:
            return {
                ...state,
                svg: {
                    ...action.payload,
                },
            }
        case TYPES.SIA_TASK_FINISHED:
            return {
                ...state,
                taskFinished: state.taskFinished + 1,
            }
        case TYPES.SIA_IMG_JUNK:
            return {
                ...state,
                isJunk: action.payload,
            }
        default:
            return state
    }
}
