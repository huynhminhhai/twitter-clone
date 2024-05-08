import { Request } from 'express'
import { getNameFromNewFileName, handleUploadSingleImage } from '~/constants/file'
import sharp from 'sharp'
import { UPLOAD_DIR } from '~/constants/dir'
import path from 'path'
import fs from 'fs'
import { isProduction } from '~/constants/config'

class MediasService {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadSingleImage(req)

    const newName = getNameFromNewFileName(file.newFilename)

    const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`)

    await sharp(file.filepath).jpeg({ quality: 80 }).toFile(newPath)

    fs.unlinkSync(file.filepath) // Remove file in temp

    return isProduction
      ? `${process.env.HOST}/statics/image/${newName}.jpg`
      : `http://localhost:${process.env.PORT}/statics/image/${newName}.jpg`
  }
}

const mediasService = new MediasService()

export default mediasService
