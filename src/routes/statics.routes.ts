import { Router } from 'express'
import { serveImageController, serveVideoController } from '~/controllers/medias.controllers'
import { wrapRequestHandler } from '~/utils/handlers'

const staticsRouter = Router()

// IMAGE
staticsRouter.get('/image/:name', wrapRequestHandler(serveImageController))

//VIDEO
staticsRouter.get('/video/:name', wrapRequestHandler(serveVideoController))

export default staticsRouter
