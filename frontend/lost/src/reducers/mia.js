import TYPES from '../types/index'
const INITIAL_STATE = {
    images: [],
    maxAmount: 10,
    zoom: 100,
}

export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case TYPES.GET_MIA_ANNOS:
            action.payload.images.map((image)=>{
                image.is_active = true
            })
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
        case TYPES.MIA_TOGGLE_ACTIVE:
            const index = state.images.findIndex(function(element){
                return element.id === action.payload.id
            })
            let newImages = state.images.slice()
            newImages[index] = action.payload
            return{
                ...state,
                images: newImages
            }
        default:
            return state
    }
}