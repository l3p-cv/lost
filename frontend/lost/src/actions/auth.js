import axios from 'axios'
import jwtDecode from 'jwt-decode'
import { useMutation } from 'react-query'
import TYPES from '../types/index'
import { API_URL } from '../lost_settings'

const useLogin = () => {
    return useMutation((credentials) =>
        axios.post(`${API_URL}/user/login`, credentials).then((res) => res.data),
    )
}

const refreshToken = async (dispatch) => {
    const decodedToken = jwtDecode(localStorage.getItem('token'))
    const diff = 5
    const compareDate = new Date(Date.now() + diff * 60000).getTime()
    if (decodedToken !== undefined && decodedToken.exp < compareDate / 1000) {
        try {
            const response = await axios.post(
                `${API_URL}/user/refresh`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('refreshToken')}`,
                    },
                },
            )
            dispatch({ type: TYPES.AUTH_USER, payload: response.data })
            localStorage.setItem('token', response.data.token)
            localStorage.setItem('refreshToken', response.data.refresh_token)
            axios.defaults.headers.common.Authorization = `Bearer ${localStorage.getItem(
                'token',
            )}`
        } catch (e) {
            await axios.post(`${API_URL}/user/logout`)
            axios.defaults.headers.common.Authorization = `Bearer ${localStorage.getItem(
                'refreshToken',
            )}`
            await axios.post(`${API_URL}/user/logout2`)
            dispatch({ type: TYPES.LOGOUT })
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('view')
            window.location.replace('/timeout')
        }
    }
}

const checkExpireDate = (lastLifesign) => async (dispatch) => {
    if (localStorage.getItem('token')) {
        const decodedToken = jwtDecode(localStorage.getItem('token'))
        if (decodedToken !== undefined) {
            const compareDateToken = new Date(Date.now() + 60000).getTime()
            const nowMinus30sec = new Date(Date.now() - 30000).getTime()
            if (decodedToken.exp * 1000 < compareDateToken) {
                if (lastLifesign > nowMinus30sec) {
                    refreshToken(dispatch)
                }
            }
            if (decodedToken.exp * 1000 < Date.now()) {
                localStorage.removeItem('token')
                localStorage.removeItem('refreshToken')
                localStorage.removeItem('view')
                dispatch({ type: TYPES.LOGOUT })
                // window.location.replace('/timeout')
                window.location.href = `${window.location.origin}/logout#timeout`
            }
        }
    }
    return null
}

const logout = () => async (dispatch) => {
    try {
        await axios.post(`${API_URL}/user/logout`)
        axios.defaults.headers.common.Authorization = `Bearer ${localStorage.getItem(
            'refreshToken',
        )}`
    } catch (e) {
        console.warn(e)
    }
    dispatch({ type: TYPES.LOGOUT })
    axios.defaults.headers.common.Authorization = undefined
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    window.location.href = `${window.location.origin}/logout#timeout`
}

export default {
    useLogin,
    logout,
    checkExpireDate,
    refreshToken,
}
