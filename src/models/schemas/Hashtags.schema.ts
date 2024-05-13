import { ObjectId } from 'mongodb'

interface HashTagType {
  _id?: ObjectId
  name: string
  created_at?: Date
}

export default class HashTag {
  _id?: ObjectId
  name: string
  created_at: Date

  constructor(hashtag: HashTagType) {
    this._id = hashtag._id || new ObjectId()
    this.name = hashtag.name
    this.created_at = hashtag.created_at || new Date()
  }
}
