import fs from 'fs'
import path from 'path'

export const initFolder = () => {
  const uploadFolderPath = path.resolve('uploads')

  if (!fs.existsSync(uploadFolderPath)) {
    fs.mkdirSync(uploadFolderPath, {
      recursive: true // to create a folder nested
    })
  }
}
