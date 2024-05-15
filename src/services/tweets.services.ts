import { ObjectId, WithId } from 'mongodb'
import { TweetRequestBody } from '~/models/request/Tweet.request'
import HashTag from '~/models/schemas/Hashtags.schema'
import Tweet from '~/models/schemas/TweetSchema'
import databaseService from '~/services/database.services'

class TweetService {
  // CHECK HASHTAGS
  async checkAndCreateHashtags(hashtags: string[]) {
    const hashTagDocument = await Promise.all(
      hashtags.map((hashtag) => {
        // Tìm hashtag trong database, nếu có thì lấy, không thì tạo mới
        return databaseService.hashtags.findOneAndUpdate(
          {
            name: hashtag
          },
          {
            $setOnInsert: new HashTag({
              name: hashtag
            })
          },
          {
            upsert: true,
            returnDocument: 'after'
          }
        )
      })
    )

    return hashTagDocument.map((hashtag) => (hashtag as WithId<HashTag>)._id)
  }

  // CREATE TWEET
  async createTweet(user_id: string, payload: TweetRequestBody) {
    const hashtags = await this.checkAndCreateHashtags(payload.hashtags)

    const result = await databaseService.tweets.insertOne(
      new Tweet({
        ...payload,
        hashtags,
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

  // INCREASE VIEW
  async increaseView(tweet_id: string, user_id?: string) {
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }

    const result = await databaseService.tweets.findOneAndUpdate(
      {
        _id: new ObjectId(tweet_id)
      },
      {
        $inc: inc,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          guest_views: 1,
          user_views: 1
        }
      }
    )

    return result
  }
}

const tweetService = new TweetService()

export default tweetService
