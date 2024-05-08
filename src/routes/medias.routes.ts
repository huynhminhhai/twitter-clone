import { Router } from 'express'
import { uploadSingleImageController } from '~/controllers/medias.controllers'
import { wrapRequestHandler } from '~/utils/handlers'

const mediaRouter = Router()

/**
 * Desc: Upload single image
 * Path: '/upload-image'
 * Method: POST
 */
mediaRouter.post('/upload-image', wrapRequestHandler(uploadSingleImageController))

export default mediaRouter
