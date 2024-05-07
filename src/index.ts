import express from 'express'
import usersRouter from '~/routes/users.routes'
import databaseService from '~/services/database.services'
import { Request, Response, NextFunction } from 'express'
import { defaultErrorHandler } from '~/middlewares/error.middlewares'
import mediaRouter from '~/routes/medias.routes'

databaseService.connect()
const app = express()
const port = 4000

app.use(express.json())

// USER
app.use('/users', usersRouter)

// MEDIA
app.use('/medias', mediaRouter)

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
