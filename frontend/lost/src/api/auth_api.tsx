import { useMutation } from 'react-query'
import { AuthRequest, AuthResponse } from '../types/auth_types'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { API_URL } from '../lost_settings'

export const useLogin = () => {
  return useMutation<AuthResponse, AxiosError, AuthRequest>((credentials) => {
    return axios
      .post(API_URL + `/user/login`, credentials)
      .then((res: AxiosResponse<AuthResponse>) => {
        // add the token to each axios request
        axios.defaults.headers.common.Authorization = `Bearer ${res.data.token}`

        return res.data
      })
  })
}

export const useLogout = () => {
  return useMutation(() => {
    return axios
      .post(API_URL + `/user/logout`, {})
      .then((res: AxiosResponse<AuthResponse>) => res.data)
      .catch((error: AxiosError) => {
        const statusCode: number | undefined = error.response?.status

        // already logged out - dont escalate error
        if (statusCode === 401) {
          return {
            alreadyLoggedOut: true,
            data: null,
          }
        }

        // escalate all other errors
        throw error
      })
  })
}

export const exchangeOidcCode = (code: string) =>
  axios.post(`${API_URL}/auth/openid/token`, { code }).then((res) => res.data)
