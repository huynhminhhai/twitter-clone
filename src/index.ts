import express from 'express'
import usersRouter from '~/routes/users.routes'
import databaseService from '~/services/database.services'
import { defaultErrorHandler } from '~/middlewares/error.middlewares'
import mediaRouter from '~/routes/medias.routes'
import { initFolder } from '~/constants/file'
import dotenv from 'dotenv'
import { UPLOAD_DIR } from '~/constants/dir'
import staticsRouter from '~/routes/statics.routes'

dotenv.config()

databaseService.connect()
const app = express()
const port = process.env.PORT || 4000

// Create uploads folder
initFolder()

app.use(express.json())
// app.use('/medias', express.static(UPLOAD_DIR))

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
