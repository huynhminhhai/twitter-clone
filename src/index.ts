import express from 'express'
import usersRouter from '~/routes/users.routes'
import databaseService from '~/services/database.services'
import { defaultErrorHandler } from '~/middlewares/error.middlewares'
import mediaRouter from '~/routes/medias.routes'
import { initFolder } from '~/constants/file'
import staticsRouter from '~/routes/statics.routes'
import { UPLOAD_DIR_VIDEO } from '~/constants/dir'
import tweetRouter from '~/routes/tweet.routes'
import bookmarksRouter from '~/routes/bookmarks.routes'
import likesRouter from '~/routes/likes.routes'
import searchRouter from '~/routes/search.routes'
import cors, { CorsOptions } from 'cors'
import helmet from 'helmet'
// import fs from 'fs'
// import path from 'path'
import swaggerUi from 'swagger-ui-express'
import swaggerJSDoc from 'swagger-jsdoc'
import { envConfig, isProduction } from '~/constants/config'

// const file = fs.readFileSync(path.resolve('twitter-swagger.yaml'), 'utf-8')

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'API Tiwtter-Clone Nodejs',
      version: '1.0.0'
    }
  },
  apis: ['./swagger/*.yaml'] // files containing annotations as above
}

const openapiSpecification = swaggerJSDoc(options)

// const swaggerDocument = YAML.parse(file)

databaseService.connect().then(() => {
  databaseService.indexUser()
  databaseService.indexRefreshToken()
  databaseService.indexFollower()
  databaseService.indexTweet()
})
const app = express()
const port = envConfig.port

// Create uploads folder
initFolder()

app.use(helmet())

const corsOption: CorsOptions = {
  origin: isProduction ? envConfig.client : '*'
}
app.use(cors())
app.use(express.json())
app.use('/statics/video', express.static(UPLOAD_DIR_VIDEO))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))

// USER
app.use('/users', usersRouter)

// TWEET
app.use('/tweets', tweetRouter)

// MEDIA
app.use('/medias', mediaRouter)

// STATIC
app.use('/statics', staticsRouter)

// BOOKMARK
app.use('/bookmarks', bookmarksRouter)

//LIKE
app.use('/likes', likesRouter)

// SEARCH
app.use('/search', searchRouter)

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
