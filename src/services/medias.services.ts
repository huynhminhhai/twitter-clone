import { Request } from 'express'
import { getNameFromNewFileName, handleUploadImage } from '~/constants/file'
import sharp from 'sharp'
import { UPLOAD_DIR } from '~/constants/dir'
import path from 'path'
import fs from 'fs'
import { isProduction } from '~/constants/config'
import { MediaType } from '~/constants/enums'
import { Media } from '~/models/Others'

class MediasService {
  async handleUploadImage(req: Request) {
    const files = await handleUploadImage(req)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromNewFileName(file.newFilename)

        const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`)

        await sharp(file.filepath).jpeg({ quality: 80 }).toFile(newPath)

        fs.unlinkSync(file.filepath) // Remove file in temp

        return {
          url: isProduction
            ? `${process.env.HOST}/statics/image/${newName}.jpg`
            : `http://localhost:${process.env.PORT}/statics/image/${newName}.jpg`,
          type: MediaType.Image
        }
      })
    )

    return result
  }
}

const mediasService = new MediasService()

export default mediasService
