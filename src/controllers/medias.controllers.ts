import { Request, Response } from 'express'
import path from 'path'
import { UPLOAD_DIR_IMAGE, UPLOAD_DIR_VIDEO } from '~/constants/dir'
import { USERS_MESSAGES } from '~/constants/messages'
import mediasService from '~/services/medias.services'

// SINGLE IMAGE
export const uploadImageController = async (req: Request, res: Response) => {
  const result = await mediasService.uploadImage(req)

  return res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESS,
    data: result
  })
}

// STATIC IMAGE FILE
export const serveImageController = async (req: Request, res: Response) => {
  const { name } = req.params

  res.sendFile(path.resolve(UPLOAD_DIR_IMAGE, name), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}

// UPLOAD VIDEO
export const uploadVideoController = async (req: Request, res: Response) => {
  const result = await mediasService.uploadVideo(req)
  return res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESS,
    data: result
  })
}

// STATIC VIDEO FILE
export const serveVideoController = async (req: Request, res: Response) => {
  const { name } = req.params

  res.sendFile(path.resolve(UPLOAD_DIR_VIDEO, name), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}
