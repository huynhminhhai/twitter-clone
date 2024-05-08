import { Request, Response } from 'express'
import { handleUploadSingleImage } from '~/constants/file'
import mediasService from '~/services/medias.services'

// SINGLE IMAGE
export const uploadSingleImageController = async (req: Request, res: Response) => {
  const result = await mediasService.handleUploadSingleImage(req)

  return res.json({
    data: result
  })
}
