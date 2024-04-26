import { RegisterRequestBody } from '~/models/request/User.request'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'

class UsersService {
  async register(payload: RegisterRequestBody) {
    const result = await databaseService.users.insertOne(
      new User({ ...payload, date_of_birth: new Date(payload.date_of_birth) })
    )

    return result
  }

  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }
}

const usersService = new UsersService()
export default usersService
