import express from 'express'
import usersRouter from '~/routes/users.routes'
import databaseService from '~/services/database.services'
import { Request, Response, NextFunction } from 'express'

const app = express()
const port = 3000
databaseService.connect()

app.use(express.json())

app.use('/users', usersRouter)

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(400).json({
    code: 0,
    error: err.message
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
