import { Collection, Db, MongoClient } from 'mongodb'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Follower from '~/models/schemas/Follower.schema'
import Tweet from '~/models/schemas/TweetSchema'
import HashTag from '~/models/schemas/Hashtags.schema'
import Bookmark from '~/models/schemas/Bookmark.schema'
import Likes from '~/models/schemas/Like.schema'
import { envConfig } from '~/constants/config'

const uri = `mongodb+srv://${envConfig.dbUserName}:${envConfig.dbPassword}@twitter.vatrpzw.mongodb.net/?retryWrites=true&w=majority&appName=Twitter`

class DatabaseService {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(envConfig.dbName)
  }

  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log('Error:', error)
      throw error
    }
  }

  async indexUser() {
    const exists = await this.users.indexExists(['email_1_password_1', 'email_1', 'username_1'])

    if (!exists) {
      this.users.createIndex({ email: 1, password: 1 })
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }, { unique: true })
    }
  }

  async indexRefreshToken() {
    const exists = await this.refreshTokens.indexExists(['token_1', 'exp_1'])

    if (!exists) {
      this.refreshTokens.createIndex({ token: 1 })
      this.refreshTokens.createIndex(
        { exp: 1 },
        {
          expireAfterSeconds: 0
        }
      )
    }
  }

  async indexFollower() {
    const exists = await this.refreshTokens.indexExists(['user_id_1_followed_user_id_1'])

    if (!exists) {
      this.follower.createIndex({ user_id: 1, followed_user_id: 1 })
    }
  }

  async indexTweet() {
    const exists = await this.tweets.indexExists(['content_text'])

    if (!exists) {
      this.tweets.createIndex({ content: 'text' }, { default_language: 'none' })
    }
  }

  get users(): Collection<User> {
    return this.db.collection(envConfig.dbUserCollection)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(envConfig.dbRefreshTokenCollection)
  }

  get follower(): Collection<Follower> {
    return this.db.collection(envConfig.dbFollowerCollection)
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(envConfig.dbTweetCollection)
  }

  get hashtags(): Collection<HashTag> {
    return this.db.collection(envConfig.dbHashtagCollection)
  }

  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(envConfig.dbBookmarkCollection)
  }

  get likes(): Collection<Likes> {
    return this.db.collection(envConfig.dbLikeCollection)
  }
}

// Tao obj tu class DatabaseService

const databaseService = new DatabaseService()
export default databaseService
