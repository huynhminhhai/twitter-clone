import { Router } from 'express'
import { serveImageController } from '~/controllers/medias.controllers'
import { wrapRequestHandler } from '~/utils/handlers'

const staticsRouter = Router()

staticsRouter.get('/image/:name', wrapRequestHandler(serveImageController))

export default staticsRouter
