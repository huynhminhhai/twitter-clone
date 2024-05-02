import { Router } from 'express'
import {
  forgotPasswordController,
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController,
  verifyEmailController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  verifyEmailTokenValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
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

export default usersRouter
