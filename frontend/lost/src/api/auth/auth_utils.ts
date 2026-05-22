import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { isEmpty } from 'lodash'
import { API_URL } from '../../lost_settings'
import { DecodedToken } from '../../types/auth_types'

const refreshToken = async () => {
  const jwt: string | null = localStorage.getItem('refreshToken')
  if (jwt === null) return

  const decodedToken = jwtDecode<DecodedToken>(jwt)

  if (isEmpty(decodedToken)) return

  const expirationTime = new Date(decodedToken.exp * 1000)

  // if refresh token also not valid anymore
  if (expirationTime < new Date()) {
    globalThis.location.replace('/logout#timeout')
  }

  try {
    const response = await axios.post(`${API_URL}/user/refresh`, undefined, {
      headers: { Authorization: `Bearer ${jwt}` },
    })

    localStorage.setItem('token', response.data.token)
    localStorage.setItem('refreshToken', response.data.refresh_token)
    axios.defaults.headers.common.Authorization = `Bearer ${response.data.token}`
  } catch (e) {
    console.error(e)
    globalThis.location.replace('/logout#timeout')
  }
}

export const getRemainingLoggedInSeconds = (): number => {
  const expirationDate = getTokenExpirationDate()

  if (expirationDate == undefined) return -1

  const now = new Date()
  if (expirationDate < now) return -1

  const remainingSeconds = Math.floor((expirationDate.getTime() - now.getTime()) / 1000)

  return remainingSeconds
}

const getTokenExpirationDate = (isRefreshToken: boolean = false): Date | undefined => {
  const tokenName = isRefreshToken ? 'refreshToken' : 'token'
  const jwt: string | null = localStorage.getItem(tokenName)
  if (jwt === null) return

  const decodedToken = jwtDecode<DecodedToken>(jwt)

  if (isEmpty(decodedToken)) return

  const expirationDate = new Date(decodedToken.exp * 1000)
  return expirationDate
}

export const checkExpireDate = (secondsOfInactivity: number) => {
  const expirationDate = getTokenExpirationDate()
  const timeInTenMinutes = new Date(Date.now() + 600000)

  // if token is valid for less than one minute and user was active recently
  if (expirationDate && timeInTenMinutes > expirationDate && secondsOfInactivity < 60) {
    return refreshToken()
  }

  // no token or token expired
  if (!expirationDate || expirationDate < new Date()) {
    // check if refresh token is still valid
    const refreshExpirationDate = getTokenExpirationDate(true)

    if (refreshExpirationDate && refreshExpirationDate > new Date()) {
      // we can still use the refresh token
      return refreshToken()
    }

    // no valid tokens - go to logout page
    globalThis.location.href = `${globalThis.location.origin}/logout#timeout`
  }
}
