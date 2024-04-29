import express from 'express'
import { body, validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import HTTP_STATUS from '~/constants/httpStatus'
import { EnitityError, ErrorWithStatus } from '~/models/Errors'
// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await validation.run(req)

    const errors = validationResult(req)

    // khong co loi thi next tiep tuc request
    if (errors.isEmpty()) {
      return next()
    }

    const errorsObject = errors.mapped()

    const entityError = new EnitityError({ errors: {} })

    for (const key in errorsObject) {
      const { msg } = errorsObject[key]

      // tra ve loi k phai do validate
      if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        return next(msg)
      }

      entityError.errors[key] = errorsObject[key]
    }

    // res.status(422).json({ errors: errorsObject })
    next(entityError)
  }
}
