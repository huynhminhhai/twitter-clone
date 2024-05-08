import { Request, Response } from 'express'
import path from 'path'
import { UPLOAD_DIR } from '~/constants/dir'
import { USERS_MESSAGES } from '~/constants/messages'
import mediasService from '~/services/medias.services'

// SINGLE IMAGE
export const uploadImageController = async (req: Request, res: Response) => {
  const result = await mediasService.handleUploadImage(req)

  return res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESS,
    data: result
  })
}

// STATIC FILE
export const serveImageController = async (req: Request, res: Response) => {
  const { name } = req.params

  res.sendFile(path.resolve(UPLOAD_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}
