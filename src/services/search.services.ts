import { ObjectId } from 'mongodb'
import { TweetAudience, TweetTypes } from '~/constants/enums'
import { SearchRequestQuery } from '~/models/request/Search.request'
import databaseService from '~/services/database.services'

class SearchService {
  async search(query: SearchRequestQuery, user_id: string) {
    const limit = Number(query.limit)

    const page = Number(query.page)

    const tweets = await databaseService.tweets
      .aggregate([
        {
          $match: {
            $text: {
              $search: query.content
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
                audience: 0
              },
              {
                $and: [
                  {
                    audience: 1
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

    const ids = tweets.map((tweet) => tweet._id) as ObjectId[]

    const inc = { user_views: 1 }

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

      databaseService.tweets
        .aggregate([
          {
            $match: {
              $text: {
                $search: query.content
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
      tweet.updated_at = date
      tweet.user_views += 1
    })

    return {
      tweets,
      limit,
      page,
      totalPage: total[0]?.total || 0
    }
  }
}

const searchSevice = new SearchService()

export default searchSevice
