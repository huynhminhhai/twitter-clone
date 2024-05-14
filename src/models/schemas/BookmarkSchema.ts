import { ObjectId } from 'mongodb'

interface BookmarkType {
  _id?: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  created_at?: Date
}

export default class Bookmark {
  _id?: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  created_at: Date

  constructor(bookmark: BookmarkType) {
    this._id = bookmark._id
    this.user_id = bookmark.user_id
    this.tweet_id = bookmark.tweet_id
    this.created_at = bookmark.created_at || new Date()
  }
}
