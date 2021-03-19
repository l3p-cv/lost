/* eslint-disable import/no-anonymous-default-export */
import TYPES from '../types/index'
const INITIAL_STATE = {
    token: '',
    expires: '',
    refreshToken: '',
    errorMessage: '',
    roles: [],
    view: '',
    loginStatus: {
        status: undefined,
        message: undefined,
    }
}

export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case TYPES.AUTH_USER:
            return {
                ...state,
                token: action.payload.token,
                refreshToken: action.payload.refresh_token,
                errorMessage: ''
            }
        case TYPES.AUTH_ERR:
            return {
                ...state,
                errorMessage: action.payload
            }
        case TYPES.CHANGE_VIEW:
            return {
                ...state,
                view: action.payload
            }
        case TYPES.DECODE_JWT:
            return {
                ...state,
                expires: action.payload.exp,
                roles: action.payload.user_claims.roles
            }
        case TYPES.LOGOUT:
            return INITIAL_STATE
        case TYPES.LOGIN_STATUS:
                return {
                    ...state,
                    loginStatus: action.payload,
                }
        default:
            return state
    }
}