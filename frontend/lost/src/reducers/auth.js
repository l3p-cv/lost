import {AUTH_USER, AUTH_ERR, CHANGE_VIEW, DECODE_JWT,LOGOUT} from '../actions/types';
const INITIAL_STATE = {
    token: '',
    expires: '',
    refreshToken: '',
    errorMessage: '',
    roles: '',
    view: 'Annotater'
};

export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case AUTH_USER:
            return {
                ...state,
                token: action.payload.token,
                refreshToken: action.payload.refresh_token
            };
        case AUTH_ERR:
            return {
                ...state,
                errorMessage: action.payload
            };
        case CHANGE_VIEW:
            return {
                ...state,
                view: action.payload
            };
        case DECODE_JWT:
            return {
                ...state,
                expires: action.payload.exp,
                roles: action.payload.roles
            };
        case LOGOUT:
            return INITIAL_STATE;
        default:
            return state;
    }
}