import { JwtPayload } from 'jsonwebtoken'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import { ParamsDictionary } from 'express-serve-static-core'

// TOKEN PAYLOAD
export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
  verify: UserVerifyStatus
  exp: number
  iat: number
}

// REGISTER
export interface RegisterRequestBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}

// LOGIN
export interface LoginRequestBody {
  email: string
  password: string
}

// LOGOUT
export interface LogoutRequestBody {
  refresh_token: string
}

// VERIFY EMAIL
export interface VerifyEmailRequestBody {
  email_verify_token: string
}

// FORGOT PASSWORD
export interface ForgotPasswordRequestBody {
  email: string
}

// VERIFY FORGOT PASSWORD TOKEN
export interface VerifyForgotPasswordRequestBody {
  forgot_password_token: string
}

// RESET PASSWORD
export interface resetPasswordRequestBody {
  password: string
  confirm_password: string
  forgot_password_token: string
}

// UPDATE ME
export interface UpdateMeRequestBody {
  name?: string
  date_of_birth?: string
  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
}

// GET USER PROFILE
export interface GetUserProfileRequestParam {
  username: string
}

// FOLLOW
export interface FollowRequestBody {
  followed_user_id: string
}

// UN FOLLOW
export interface UnFollowRequestParam extends ParamsDictionary {
  user_id: string
}
