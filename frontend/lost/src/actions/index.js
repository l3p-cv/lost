import axios from 'axios';
import { AUTH_USER, AUTH_ERR } from './types';

export const login = (formProps, callback) => async dispatch => {
    try {
        const response = await axios.post('http://localhost:3090/signup', formProps);
        dispatch({ type: AUTH_USER, payload: response.data.token});
        localStorage.setItem('token', response.data.token);
        callback();
    } catch(e){
        dispatch({ type: AUTH_ERR, payload: 'Something went wrong.'});
    }
};
                
    