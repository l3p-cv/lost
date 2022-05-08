import TYPES from '../types/index'
const INITIAL_STATE = {
    images: [],
    proposedLabel: undefined,
    maxAmount: localStorage.getItem('mia-max-amount')
        ? localStorage.getItem('mia-max-amount')
        : 10,
    zoom: localStorage.getItem('mia-zoom') ? localStorage.getItem('mia-zoom') : 100,
    labels: [],
    selectedLabel: undefined,
}

export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case TYPES.GET_MIA_ANNOS:
            action.payload.images.map((image) => {
                image.is_active = true
                return undefined
            })
            return {
                ...state,
                images: action.payload.images,
                proposedLabel: action.payload.proposedLabel,
            }
        case TYPES.MIA_ZOOM:
            return {
                ...state,
                zoom: action.payload,
            }
        case TYPES.MIA_AMOUNT:
            return {
                ...state,
                maxAmount: action.payload,
            }
        case TYPES.MIA_TOGGLE_ACTIVE:
            const index = state.images.findIndex(function (element) {
                return element.id === action.payload.id
            })
            let newImages = state.images.slice()
            newImages[index] = action.payload
            return {
                ...state,
                images: newImages,
            }
        case TYPES.GET_MIA_LABEL:
            return {
                ...state,
                labels: action.payload.labels,
            }
        case TYPES.MIA_SELECT_LABEL:
            return {
                ...state,
                selectedLabel: action.payload,
            }
        case TYPES.MIA_UPDATE:
            return {
                ...state,
            }
        default:
            return state
    }
}
