import { Router } from 'express'
import { uploadSingleImageController } from '~/controllers/medias.controllers'

const mediaRouter = Router()

/**
 * Desc: Upload single image
 * Path: '/upload-image'
 * Method: POST
 */
mediaRouter.post('/upload-image', uploadSingleImageController)

export default mediaRouter
