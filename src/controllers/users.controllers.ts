import { NextFunction, Request, Response } from 'express'
import usersService from '~/services/user.services'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  ChangePasswordRequestBody,
  FollowRequestBody,
  ForgotPasswordRequestBody,
  GetUserProfileRequestParam,
  LoginRequestBody,
  LogoutRequestBody,
  RefreshTokenRequestBody,
  RegisterRequestBody,
  TokenPayload,
  UnFollowRequestParam,
  UpdateMeRequestBody,
  VerifyEmailRequestBody,
  VerifyForgotPasswordRequestBody,
  resetPasswordRequestBody
} from '~/models/request/User.request'
import { ObjectId } from 'mongodb'
import User from '~/models/schemas/User.schema'
import { USERS_MESSAGES } from '~/constants/messages'
import databaseService from '~/services/database.services'
import HTTP_STATUS from '~/constants/httpStatus'
import { UserVerifyStatus } from '~/constants/enums'
import { envConfig } from '~/constants/config'

// LOGIN
export const loginController = async (req: Request<ParamsDictionary, any, LoginRequestBody>, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId

  const result = await usersService.login({
    user_id: user_id.toString(),
    verify: user.verify
  })

  return res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

// OAUTH LOGIN
export const oauthLoginController = async (req: Request, res: Response) => {
  const { code } = req.query

  const result = await usersService.oauth(code as string)

  const uriRedirectClient = `${envConfig.googleRedirectClient}?access_token=${result.access_token}&refresh_token=${result.refresh_token}&new_user=${result.newUser}&verify=${result.verify}`

  return res.redirect(uriRedirectClient)
}

// REGISTER
export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await usersService.register(req.body)

  return res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

// REFRESH TOKEN
export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenRequestBody>,
  res: Response
) => {
  const { refresh_token } = req.body

  const { user_id, verify, exp } = req.decoded_refresh_token as TokenPayload

  const result = await usersService.refreshToken(user_id, verify, refresh_token, exp)

  return res.json({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
    data: result
  })
}

// LOGOUT
export const logoutController = async (req: Request<ParamsDictionary, any, LogoutRequestBody>, res: Response) => {
  const { refresh_token } = req.body

  const result = await usersService.logout(refresh_token)

  return res.json(result)
}

// VERIFY EMAIL
export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, VerifyEmailRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload

  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }

  // if verify already then return status 200 and message verified before
  if (user.email_verify_token === '') {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }

  const result = await usersService.verifyEmail(user_id)

  return res.json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
  })
}

// RESEND VERIFY EMAIL
export const resendEmailVerifyController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

  if (!user) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }

  if (user?.verify === UserVerifyStatus.Verified) {
    res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }

  const result = await usersService.resendVerifyEmail(user_id)

  res.json(result)
}

// FORGOT PASSWORD
export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordRequestBody>,
  res: Response
) => {
  const { _id, verify } = req.user as User

  const result = await usersService.forgotPassword({ user_id: (_id as ObjectId).toString(), verify: verify })

  return res.json(result)
}

// VERIFY FORGOT PASSWORD TOKEN
export const verifyForgotPasswordTokenController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordRequestBody>,
  res: Response
) => {
  return res.json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS
  })
}

// RESET PASSWORD
export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, resetPasswordRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload

  const { password } = req.body

  const result = await usersService.resetPassword(user_id, password)

  res.json(result)
}

// ME
export const meController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await usersService.me(user_id)

  res.json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    result
  })
}

// UPDATE ME
export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  console.log(req.body)

  const result = await usersService.updateMe(user_id, req.body)

  res.json({
    message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
    data: result
  })
}

// GET USER PROFILE
export const getUserProfileController = async (req: Request<GetUserProfileRequestParam>, res: Response) => {
  const { username } = req.params

  const result = await usersService.getUserProfile(username)

  res.json({ messgae: USERS_MESSAGES.GET_PROFILE_SUCCESS, data: result })
}

// FOLLOW
export const followController = async (req: Request<ParamsDictionary, any, FollowRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const { followed_user_id } = req.body

  const result = await usersService.follow(user_id, followed_user_id)

  res.json(result)
}

// UN FOLLOW
export const unFollowController = async (req: Request<UnFollowRequestParam>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const { user_id: followed_user_id } = req.params

  const result = await usersService.unFollow(user_id, followed_user_id)

  res.json(result)
}

// CHANGE PASSWORD
export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const { password } = req.body

  const result = await usersService.changePassword(user_id, password)

  res.json(result)
}
