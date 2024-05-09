import { Router } from 'express'
import { serveImageController, serveVideoStreamController } from '~/controllers/medias.controllers'
import { wrapRequestHandler } from '~/utils/handlers'

const staticsRouter = Router()

// IMAGE
staticsRouter.get('/image/:name', wrapRequestHandler(serveImageController))

//VIDEO
staticsRouter.get('/video-stream/:name', wrapRequestHandler(serveVideoStreamController))

export default staticsRouter
