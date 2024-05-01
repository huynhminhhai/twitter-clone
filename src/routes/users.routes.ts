import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { accessTokenValidator, loginValidator, registerValidator } from '~/middlewares/users.middlewares'
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

usersRouter.post(
  '/logout',
  accessTokenValidator,
  wrapRequestHandler((req, res, next) => {
    res.json({
      message: 'Logout Success'
    })
  })
)

export default usersRouter
