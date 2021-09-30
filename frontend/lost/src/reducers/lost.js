import TYPES from '../types/index'

const initIsNavBarVisible = localStorage.getItem('isNavBarVisible') === 'true'
console.log('initIsNavBarVisible')
console.log(initIsNavBarVisible)
const INITIAL_STATE = {
    isNavBarVisible: initIsNavBarVisible === undefined? true: initIsNavBarVisible,
    version: '',
    settings: {
        autoLogoutWarnTime: 300,
        autoLogoutTime: 3600,
        isDevMode: true
    }
}

export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case TYPES.SET_NAVBAR_VISIBLE:
            localStorage.setItem('isNavBarVisible', action.payload)
            return {
                ...state,
                isNavBarVisible: action.payload,
            }
        case TYPES.SET_SETTINGS:
            return {
                ...state,
                settings: action.payload,
            }
        case TYPES.SET_ROLES:
            return {
                ...state,
                roles: action.payload
            }
        case TYPES.SET_VERSION:
            return {
                ...state,
                version: action.payload
            }
        default:
            return state
    }
}
