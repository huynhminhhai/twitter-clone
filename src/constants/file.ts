import { Request } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import { UPLOAD_DIR_TEMP_IMAGE, UPLOAD_DIR_TEMP_VIDEO, UPLOAD_DIR_VIDEO } from '~/constants/dir'

export const initFolder = () => {
  ;[UPLOAD_DIR_TEMP_IMAGE, UPLOAD_DIR_TEMP_VIDEO].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true // to create a folder nested
      })
    }
  })
}

export const handleUploadImage = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_DIR_TEMP_IMAGE,
    maxFields: 4,
    keepExtensions: true,
    maxFileSize: 500 * 1024, // 500KB
    maxTotalFileSize: 500 * 1024 * 4,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))

      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid or key name is not /image/') as any)
      }

      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.image)) {
        return reject(new Error('File is empty'))
      }

      resolve(files.image as File[])
    })
  })
}

export const getNameFromNewFileName = (fullname: string) => {
  const namearr = fullname.split('.')
  namearr.pop()
  return namearr.join('')
}

export const handleUploadVideo = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_DIR_VIDEO,
    maxFields: 1,
    maxFileSize: 500 * 1024 * 1024, // 50MB
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'video' && Boolean(mimetype?.includes('mp4') || mimetype?.includes('quicktime'))

      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid or key name is not /video/') as any)
      }

      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.video)) {
        return reject(new Error('File is empty'))
      }

      const videos = files.video

      videos?.forEach((video) => {
        const ext = getExtension(video.originalFilename as string)

        fs.renameSync(video.filepath, video.filepath + '.' + ext)

        video.newFilename = video.newFilename + '.' + ext
      })

      resolve(files.video as File[])
    })
  })
}

export const getExtension = (fullname: string) => {
  const namearr = fullname.split('.')

  return namearr[namearr.length - 1]
}
