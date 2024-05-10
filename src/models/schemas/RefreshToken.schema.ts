import { ObjectId } from 'mongodb'

interface RefreshTokenType {
  _id?: ObjectId
  token: string
  created_at?: Date
  user_id: ObjectId
  iat: number
  exp: number
}

export default class RefreshToken {
  _id?: ObjectId
  token: string
  created_at: Date
  user_id: ObjectId
  iat: Date
  exp: Date

  constructor(refreshToken: RefreshTokenType) {
    this._id = refreshToken._id
    this.token = refreshToken.token
    this.created_at = refreshToken.created_at || new Date()
    this.user_id = refreshToken.user_id
    this.iat = new Date(refreshToken.iat * 1000) // Convert Epoch time to Date
    this.exp = new Date(refreshToken.exp * 1000) // Convert Epoch time to Date
  }
}
