import { ObjectId } from 'mongodb'
import { TweetRequestBody } from '~/models/request/Tweet.request'
import Tweet from '~/models/schemas/TweetSchema'
import databaseService from '~/services/database.services'

class TweetService {
  async createTweet(user_id: string, payload: TweetRequestBody) {
    const result = await databaseService.tweets.insertOne(
      new Tweet({
        ...payload,
        hashtags: [],
        user_id: new ObjectId(user_id)
      })
    )

    const tweet = await databaseService.tweets.findOne(
      {
        _id: new ObjectId(result.insertedId)
      },
      {
        projection: {
          created_at: 0,
          updated_at: 0
        }
      }
    )

    return tweet
  }
}

const tweetService = new TweetService()

export default tweetService
