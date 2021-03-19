import TYPES from '../types/index'

const INITIAL_STATE = {
    isNavBarVisible: true,
    version: '0.0.0',
    settings: {
        autoLogoutWarnTime: 300,
        autoLogoutTime: 6000,
        isDevMode: true
    }
}

export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case TYPES.SET_NAVBAR_VISIBLE:
            return {
                ...state,
                isNavBarVisible: action.payload,
            }
        case TYPES.SET_SETTINGS:
            return {
                ...state,
                settings: action.payload,
            }
        default:
            return state
    }
}
