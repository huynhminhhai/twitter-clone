import express from 'express'
import usersRouter from '~/routes/users.routes'
import databaseService from '~/services/database.services'
import { defaultErrorHandler } from '~/middlewares/error.middlewares'
import mediaRouter from '~/routes/medias.routes'
import { initFolder } from '~/constants/file'
import dotenv from 'dotenv'
import staticsRouter from '~/routes/statics.routes'
import { UPLOAD_DIR_VIDEO } from '~/constants/dir'

dotenv.config()

databaseService.connect().then(() => {
  databaseService.indexUser()
  databaseService.indexRefreshToken()
  databaseService.indexFollower()
})
const app = express()
const port = process.env.PORT || 4000

// Create uploads folder
initFolder()

app.use(express.json())
app.use('/statics/video', express.static(UPLOAD_DIR_VIDEO))

// USER
app.use('/users', usersRouter)

// MEDIA
app.use('/medias', mediaRouter)

// STATIC
app.use('/statics', staticsRouter)

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
