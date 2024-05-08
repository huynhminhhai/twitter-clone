import { Request, Response } from 'express'
import { handleUploadSingleImage } from '~/constants/file'

// SINGLE IMAGE
export const uploadSingleImageController = async (req: Request, res: Response) => {
  const result = await handleUploadSingleImage(req)

  return res.json({
    data: result
  })
}
