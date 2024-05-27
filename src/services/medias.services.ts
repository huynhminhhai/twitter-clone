import { Request } from 'express'
import { getNameFromNewFileName, handleUploadImage, handleUploadVideo } from '~/constants/file'
import sharp from 'sharp'
import { UPLOAD_DIR_IMAGE, UPLOAD_DIR_VIDEO } from '~/constants/dir'
import path from 'path'
import fs from 'fs'
import { envConfig, isProduction } from '~/constants/config'
import { MediaType } from '~/constants/enums'
import { Media } from '~/models/Others'

class MediasService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromNewFileName(file.newFilename)

        const newPath = path.resolve(UPLOAD_DIR_IMAGE, `${newName}.jpg`)

        await sharp(file.filepath).jpeg({ quality: 80 }).toFile(newPath)

        fs.unlinkSync(file.filepath) // Remove file in temp

        return {
          url: isProduction
            ? `${envConfig.host}/statics/image/${newName}.jpg`
            : `http://localhost:${envConfig.port}/statics/image/${newName}.jpg`,
          type: MediaType.Image
        }
      })
    )

    return result
  }

  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)

    const { newFilename } = files[0]

    const result: Media[] = files.map((file) => {
      return {
        url: isProduction
          ? `${envConfig.host}/statics/video/${newFilename}`
          : `http://localhost:${envConfig.port}/statics/video/${newFilename}`,
        type: MediaType.Video
      }
    })

    return result
  }
}

const mediasService = new MediasService()

export default mediasService
