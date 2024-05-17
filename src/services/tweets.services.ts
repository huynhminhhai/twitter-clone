import { ObjectId, WithId } from 'mongodb'
import { TweetAudience, TweetTypes } from '~/constants/enums'
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
          user_views: 1,
          updated_at: 1
        }
      }
    )

    return result
  }

  // GET CHILDREN TWEET
  async getChildrenTweet(tweet_id: string, tweet_type: TweetTypes, limit: number, page: number, user_id?: string) {
    const tweets = await databaseService.tweets
      .aggregate<Tweet>([
        {
          $match: {
            parent_id: new ObjectId(tweet_id),
            type: tweet_type
          }
        },
        {
          $lookup: {
            from: 'hashtags',
            localField: 'hashtags',
            foreignField: '_id',
            as: 'hashtags'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'mentions',
            foreignField: '_id',
            as: 'mentions'
          }
        },
        {
          $lookup: {
            from: 'bookmarks',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'bookmarks'
          }
        },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'likes'
          }
        },
        {
          $lookup: {
            from: 'tweets',
            localField: '_id',
            foreignField: 'parent_id',
            as: 'tweet_child'
          }
        },
        {
          $addFields: {
            bookmarks: {
              $size: '$bookmarks'
            },
            likes: {
              $size: '$likes'
            },
            mentions: {
              $map: {
                input: '$mentions',
                as: 'mention',
                in: {
                  _id: '$$mention._id',
                  name: '$$mention.name',
                  username: '$$mention.username',
                  email: '$$mention.email'
                }
              }
            },
            retweets: {
              $size: {
                $filter: {
                  input: '$tweet_child',
                  as: 'tweet',
                  cond: {
                    $eq: ['$$tweet.type', TweetTypes.Retweet]
                  }
                }
              }
            },
            comments: {
              $size: {
                $filter: {
                  input: '$tweet_child',
                  as: 'tweet',
                  cond: {
                    $eq: ['$$tweet.type', TweetTypes.Comment]
                  }
                }
              }
            },
            quotes: {
              $size: {
                $filter: {
                  input: '$tweet_child',
                  as: 'tweet',
                  cond: {
                    $eq: ['$$tweet.type', TweetTypes.QuoteTweet]
                  }
                }
              }
            },
            views: {
              $add: ['$user_views', '$guest_views']
            }
          }
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      ])
      .toArray()

    const ids = tweets.map((tweet) => tweet._id) as ObjectId[]

    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }

    const date = new Date()

    const [, total] = await Promise.all([
      databaseService.tweets.updateMany(
        {
          _id: {
            $in: ids
          }
        },
        {
          $inc: inc,
          $set: {
            updated_at: date
          }
        }
      ),

      databaseService.tweets.countDocuments({
        parent_id: new ObjectId(tweet_id),
        type: tweet_type
      })
    ])

    tweets.forEach((tweet) => {
      tweet.updated_at = date
      if (user_id) {
        tweet.user_views += 1
      } else {
        tweet.guest_views += 1
      }
    })

    return { tweets, total }
  }

  // GET NEW FEED
  async getNewFeed(user_id: string, limit: number, page: number) {
    const followers = await databaseService.follower
      .find({
        user_id: new ObjectId(user_id)
      })
      .toArray()

    const idFollwers = followers.map((follow) => follow.followed_user_id)

    idFollwers.push(new ObjectId(user_id))

    const tweets = await databaseService.tweets
      .aggregate([
        {
          $match: {
            user_id: {
              $in: idFollwers
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: {
            path: '$user'
          }
        },
        {
          $match: {
            $or: [
              {
                audience: TweetAudience.Everyone
              },
              {
                $and: [
                  {
                    audience: TweetAudience.TwitterCircle
                  },
                  {
                    'user.twitter_circle': {
                      $in: [new ObjectId(user_id)]
                    }
                  }
                ]
              }
            ]
          }
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        },
        {
          $lookup: {
            from: 'hashtags',
            localField: 'hashtags',
            foreignField: '_id',
            as: 'hashtags'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'mentions',
            foreignField: '_id',
            as: 'mentions'
          }
        },
        {
          $lookup: {
            from: 'bookmarks',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'bookmarks'
          }
        },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'likes'
          }
        },
        {
          $lookup: {
            from: 'tweets',
            localField: '_id',
            foreignField: 'parent_id',
            as: 'tweet_child'
          }
        },
        {
          $addFields: {
            bookmarks: {
              $size: '$bookmarks'
            },
            likes: {
              $size: '$likes'
            },
            mentions: {
              $map: {
                input: '$mentions',
                as: 'mention',
                in: {
                  _id: '$$mention._id',
                  name: '$$mention.name',
                  username: '$$mention.username',
                  email: '$$mention.email'
                }
              }
            },
            retweets: {
              $size: {
                $filter: {
                  input: '$tweet_child',
                  as: 'tweet',
                  cond: {
                    $eq: ['$$tweet.type', TweetTypes.Retweet]
                  }
                }
              }
            },
            comments: {
              $size: {
                $filter: {
                  input: '$tweet_child',
                  as: 'tweet',
                  cond: {
                    $eq: ['$$tweet.type', TweetTypes.Comment]
                  }
                }
              }
            },
            quotes: {
              $size: {
                $filter: {
                  input: '$tweet_child',
                  as: 'tweet',
                  cond: {
                    $eq: ['$$tweet.type', TweetTypes.QuoteTweet]
                  }
                }
              }
            },
            views: {
              $add: ['$user_views', '$guest_views']
            }
          }
        },
        {
          $project: {
            user: {
              password: 0,
              email_verify_token: 0,
              forgot_password_token: 0,
              twitter_circle: 0
            }
          }
        }
      ])
      .toArray()

    const idTweets = tweets.map((tweet) => tweet._id as ObjectId)

    const date = new Date()

    const [, total] = await Promise.all([
      databaseService.tweets.updateMany(
        {
          _id: {
            $in: idTweets
          }
        },
        {
          $inc: { user_views: 1 },
          $set: {
            updated_at: date
          }
        }
      ),
      databaseService.tweets
        .aggregate([
          {
            $match: {
              user_id: {
                $in: idFollwers
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: {
              path: '$user'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: TweetAudience.Everyone
                },
                {
                  $and: [
                    {
                      audience: TweetAudience.TwitterCircle
                    },
                    {
                      'user.twitter_circle': {
                        $in: [new ObjectId(user_id)]
                      }
                    }
                  ]
                }
              ]
            }
          },
          {
            $count: 'total'
          }
        ])
        .toArray()
    ])

    tweets.forEach((tweet) => {
      ;(tweet.updated_at = date), (tweet.updated_at += 1)
    })

    return {
      tweets,
      totalPage: total[0].total
    }
  }
}

const tweetService = new TweetService()

export default tweetService
