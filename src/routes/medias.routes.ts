import { Router } from 'express'
import { uploadImageController } from '~/controllers/medias.controllers'
import { wrapRequestHandler } from '~/utils/handlers'

const mediaRouter = Router()

/**
 * Desc: Upload image
 * Path: '/upload-image'
 * Method: POST
 */
mediaRouter.post('/upload-image', wrapRequestHandler(uploadImageController))

export default mediaRouter
