export type AuthRequest = {
  password: string
  userName: string
}

export type AuthResponse = {
  token: string
  refresh_token: string
}

export type DecodedToken = {
  iat: number
  nbf: number
  jti: string
  exp: number
  identity: number
  fresh: boolean
  type: string
  user_claims: UserClaims
}

export type UserClaims = {
  roles: string[]
}
