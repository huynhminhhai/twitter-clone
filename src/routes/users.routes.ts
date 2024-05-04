import { Router } from 'express'
import {
  followController,
  forgotPasswordController,
  getUserProfileController,
  loginController,
  logoutController,
  meController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  unFollowController,
  updateMeController,
  verifyEmailController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unFollowValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyEmailTokenValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeRequestBody } from '~/models/request/User.request'
import { wrapRequestHandler } from '~/utils/handlers'

const usersRouter = Router()

/**
 * Desc: Login a user
 * Path: /login
 * Method: POST
 * Body: {email: string, password: string}
 */

usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

/**
 * Desc: Register a user
 * Path: /register
 * Method: POST
 * Body: {name: string, email: string, password: string, confirm_password: string, date_of_birth: Date}
 */

usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

/**
 * Desc: Logout a user
 * Path: /logout
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { refresh_token: string }
 */

usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

/**
 * Desc: Verify email when user click the link in email
 * Path: /verify-email
 * Method: POST
 * Body: { email_verify_token: string }
 */
usersRouter.post('/verify-email', verifyEmailTokenValidator, wrapRequestHandler(verifyEmailController))

/**
 * Desc: Resend verify token
 * Path: /resend-verify-email
 * Method: POST
 * Headers: { authorization: Bearer <access_token> }
 */
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendEmailVerifyController))

/**
 * Desc: Forgot password
 * Path: /forgot-password
 * Method: POST
 * Body: {email: string}
 */
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

/**
 * Desc: Verify Forgot password
 * Path: /verify-forgot-password
 * Method: POST
 * Body: {forgot_password_token: string}
 */
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordTokenController)
)

/**
 * Desc: Reset Password
 * Path: /reset-password
 * Method: POST
 * Body: {forgot_password_token: string, password: string, confirm_password: string}
 */
usersRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))

/**
 * Desc: Get profile
 * Path: /me
 * Method: GET
 * Headers: { authorization: Bearer <access_token> }
 */
usersRouter.get('/me', accessTokenValidator, wrapRequestHandler(meController))

/**
 * Desc: Update profile
 * Path: /me
 * Method: PATCH
 * Headers: { authorization: Bearer <access_token> }
 * Body: User Schema
 */
usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddleware<UpdateMeRequestBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
  ]),
  wrapRequestHandler(updateMeController)
)

/**
 * Desc: Get user profile
 * Path: /:username
 * Method: GET
 */
usersRouter.get('/:username', wrapRequestHandler(getUserProfileController))

/**
 * Desc: Follow a user
 * Path: /follow
 * Method: POST
 * Headers: { authorization: Bearer <access_token> }
 * Body: {followed_user_id: string}
 */
usersRouter.post(
  '/follow',
  accessTokenValidator,
  verifiedUserValidator,
  followValidator,
  wrapRequestHandler(followController)
)

/**
 * Desc: unFollow a user
 * Path: /follow/:user_id
 * Method: DELETE
 * Headers: { authorization: Bearer <access_token> }
 */
usersRouter.delete(
  '/follow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unFollowValidator,
  wrapRequestHandler(unFollowController)
)

export default usersRouter
