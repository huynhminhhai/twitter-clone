import { Request, Response } from 'express'
import usersService from '~/services/user.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterRequestBody } from '~/models/request/User.request'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body

  if (email === 'huynhminhhai1555@gmail.com' && password === '123456') {
    res.json({
      message: 'Login Success!!!'
    })
  }

  return res.status(400).json({
    error: 'Login Failed!!!'
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterRequestBody>, res: Response) => {
  try {
    const result = await usersService.register(req.body)

    return res.json({
      message: 'Register Success^^',
      result
    })
  } catch (error) {
    return res.status(400).json({
      message: 'Register Failed~~',
      error
    })
  }
}
