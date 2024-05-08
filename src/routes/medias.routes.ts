import { Router } from 'express'
import { uploadImageController, uploadVideoController } from '~/controllers/medias.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const mediaRouter = Router()

/**
 * Desc: Upload image
 * Path: '/upload-image'
 * Method: POST
 * Headers: Bearer <access_token>
 */
mediaRouter.post(
  '/upload-image',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadImageController)
)

/**
 * Desc: Upload video
 * Path: '/upload-video'
 * Method: POST
 * Headers: Bearer <access_token>
 */
mediaRouter.post(
  '/upload-video',
  // accessTokenValidator,
  // verifiedUserValidator,
  wrapRequestHandler(uploadVideoController)
)

export default mediaRouter
