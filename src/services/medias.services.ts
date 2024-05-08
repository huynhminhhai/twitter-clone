import { Request } from 'express'
import { getNameFromNewFileName, handleUploadSingleImage } from '~/constants/file'
import sharp from 'sharp'
import { UPLOAD_DIR } from '~/constants/dir'
import path from 'path'
import fs from 'fs'

class MediasService {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadSingleImage(req)

    const newName = getNameFromNewFileName(file.newFilename)

    const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`)

    await sharp(file.filepath).jpeg({ quality: 80 }).toFile(newPath)

    console.log(file.filepath)

    fs.unlinkSync(file.filepath) // Remove file in temp

    return `http://localhost:3000/uploads/${newName}.jpg`
  }
}

const mediasService = new MediasService()

export default mediasService
