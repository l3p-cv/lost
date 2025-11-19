import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { isEmpty } from 'lodash'
import { useMutation } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { showError } from '../components/Notification'
import { API_URL } from '../lost_settings'
import { httpClient } from './http-client'

export interface AuthRequest {
  password: string
  userName: string
}

export interface AuthResponse {
  token: string
  refresh_token: string
}

export interface DecodedToken {
  iat: number
  nbf: number
  jti: string
  exp: number
  identity: number
  fresh: boolean
  type: string
  user_claims: UserClaims
}

export interface UserClaims {
  roles: string[]
}

export const useLogin = () => {
  const navigate = useNavigate()
  let username = ''
  return useMutation({
    mutationFn: (credentials: AuthRequest) => {
      username = credentials.userName
      return httpClient.post<AuthResponse>('/user/login', credentials)
    },
    onSuccess: (data) => {
      localStorage.setItem('username', username)
      localStorage.setItem('token', data.token)
      localStorage.setItem('refreshToken', data.refresh_token)
      navigate('/')
    },

    onError: () => {
      showError('An error occurred when logging in')
    },
  })
}

const refreshToken = async () => {
  const decodedToken = jwtDecode<DecodedToken>(localStorage.getItem('token') || '')
  const diff = 5
  const compareDate = new Date(Date.now() + diff * 60000).getTime()
  if (!isEmpty(decodedToken) && decodedToken.exp < compareDate / 1000) {
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
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('refreshToken', response.data.refresh_token)
      axios.defaults.headers.common.Authorization = `Bearer ${localStorage.getItem(
        'token',
      )}`
    } catch (e) {
      console.error(e)
      await axios.post(`${API_URL}/user/logout`)
      axios.defaults.headers.common.Authorization = `Bearer ${localStorage.getItem(
        'refreshToken',
      )}`
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('view')
      window.location.replace('/timeout')
    }
  }
}

export const checkExpireDate = (lastLifesign) => {
  if (localStorage.getItem('token')) {
    const decodedToken = jwtDecode<DecodedToken>(localStorage.getItem('token') || '')
    if (!isEmpty(decodedToken)) {
      const compareDateToken = new Date(Date.now() + 60000).getTime()
      const nowMinus30sec = new Date(Date.now() - 30000).getTime()
      if (decodedToken.exp * 1000 < compareDateToken) {
        if (lastLifesign > nowMinus30sec) {
          refreshToken()
        }
      }
      if (decodedToken.exp * 1000 < Date.now()) {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('view')
        window.location.href = `${window.location.origin}/logout#timeout`
      }
    }
  }
}

export const useLogout = () => {
  return useMutation({
    mutationFn: () => {
      return axios.post(`${API_URL}/user/logout`)
    },
    onSuccess: (response, _, context) => {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')

      // if a custom success handler exists, call it
      // @ts-expect-error this ts error can be ignored
      context?.onSuccess?.(response)
    },
    onError: () => {
      showError('An error occurred when logging out')
    },
  })
}
