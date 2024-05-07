import { Request, Response } from 'express'
import formidable from 'formidable'
import path from 'path'

// SINGLE IMAGE
export const uploadSingleImageController = (req: Request, res: Response) => {
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    maxFields: 1,
    keepExtensions: true,
    maxFileSize: 300 * 1024 // 300KB
  })

  form.parse(req, (err, fields, files) => {
    if (err) {
      throw err
    }

    return res.json({
      message: 'Upload image success'
    })
  })
}
