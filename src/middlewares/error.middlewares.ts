import { NextFunction, Request, Response } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // res.status(err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json(omit(err, 'status'))
  res.status(err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
    err.status
      ? omit(err, 'status')
      : {
          message: err.message
        }
  )
}
