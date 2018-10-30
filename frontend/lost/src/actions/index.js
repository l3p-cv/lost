import axios from 'axios';
import { AUTH_USER, AUTH_ERR, CHANGE_VIEW, DECODE_JWT, LOGOUT } from './types';
import { API_URL } from './settings';

//axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token');

export const login = (formProps, callback) => async dispatch => {
    try {
        const response = await axios.post(API_URL + 'user/login/', formProps);
        dispatch({ type: AUTH_USER, payload: response.data});
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refresh_token);
        callback();
    } catch(e){
        dispatch({ type: AUTH_ERR, payload: 'No valid credentials.'});
    }
};

export const decodeJwt = (decoded_token, callback) => async dispatch => {
    if (decoded_token !== undefined && decoded_token.exp < Date.now() / 1000){
        dispatch({type: LOGOUT});
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        callback();
    }
    dispatch({ type: DECODE_JWT, payload: decoded_token})
}
export const changeView = (view) => async dispatch => {
    dispatch({ type: CHANGE_VIEW, payload: view});
};
