import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetTypes, UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { TWEETS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/request/User.request'
import Tweet from '~/models/schemas/TweetSchema'
import databaseService from '~/services/database.services'
import { numberEnumToArray } from '~/utils/others'
import { validate } from '~/utils/validation'

const tweetTypess = numberEnumToArray(TweetTypes)

const audienceTypes = numberEnumToArray(TweetAudience)

const mediaTypes = numberEnumToArray(MediaType)

// CREATE TWEET
export const createTweetValidator = validate(
  checkSchema(
    {
      type: {
        isIn: {
          options: [tweetTypess],
          errorMessage: TWEETS_MESSAGES.INVALID_TYPE
        }
      },
      audience: {
        isIn: {
          options: [audienceTypes],
          errorMessage: TWEETS_MESSAGES.INVALID_AUDIENCE
        }
      },
      parent_id: {
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetTypes
            // eslint-disable-next-line no-irregular-whitespace
            // Nếu type là retweet, comment, quotetweet thì parent_id phải là tweet_id của tweet cha
            if (
              [TweetTypes.Retweet, TweetTypes.Comment, TweetTypes.QuoteTweet].includes(type) &&
              !ObjectId.isValid(value)
            ) {
              throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_A_VALID_TWEET_ID)
            }

            // eslint-disable-next-line no-irregular-whitespace
            // Nếu type là tweet thì parent_id phải là null
            if (type === TweetTypes.Tweet && value !== null) {
              throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_NULL)
            }

            return true
          }
        }
      },
      content: {
        isString: true,
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetTypes

            const mentions = req.body.mentions as string[]

            const hashtags = req.body.hashtags as string[]

            // eslint-disable-next-line no-irregular-whitespace
            // Nếu type là retweet thì content phải là ''
            if (type === TweetTypes.Retweet && value !== '') {
              throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_EMPTY_STRING)
            }

            // eslint-disable-next-line no-irregular-whitespace
            // Nếu type là comment, quotetweet, tweet và không có mentions và hashtags thì content phải là string và không được rỗng
            if (
              [TweetTypes.Comment, TweetTypes.QuoteTweet, TweetTypes.Tweet].includes(type) &&
              isEmpty(mentions) &&
              isEmpty(hashtags) &&
              typeof value !== 'string' &&
              value === ''
            ) {
              throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_A_NON_EMPTY_STRING)
            }

            return true
          }
        }
      },
      hashtags: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            // Yêu cầu mỗi phần tử trong array là string
            if (value.some((item: any) => typeof item !== 'string')) {
              throw new Error(TWEETS_MESSAGES.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING)
            }

            return true
          }
        }
      },
      mentions: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            // Yêu cầu mỗi phần tử trong array là user_id
            if (value.some((item: any) => !ObjectId.isValid(item))) {
              throw new Error(TWEETS_MESSAGES.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID)
            }

            return true
          }
        }
      },
      medias: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            // Yêu cầu mỗi phần tử trong array là Media Object
            if (
              value.some((item: any) => {
                return typeof item.url !== 'string' || !mediaTypes.includes(item.type)
              })
            ) {
              throw new Error(TWEETS_MESSAGES.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT)
            }

            return true
          }
        }
      }
    },
    ['body']
  )
)

// CHECK TWEET ID
export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: TWEETS_MESSAGES.INVALID_TWEET_ID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }

            const [tweet] = await databaseService.tweets
              .aggregate<Tweet>([
                {
                  $match: {
                    _id: new ObjectId(value)
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
                }
              ])
              .toArray()

            if (tweet === null) {
              throw new ErrorWithStatus({
                message: TWEETS_MESSAGES.TWEET_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            req.tweet = tweet

            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)

// AUDIENCE
export const audienceValidator = async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet as Tweet

  if (tweet.audience === TweetAudience.TwitterCircle) {
    // Kiem tra nguoi xem tweet nay da dang nhap hay chua
    if (!req.decoded_authorization) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }

    const author = await databaseService.users.findOne({
      _id: new ObjectId(tweet.user_id)
    })

    // Kiem tra tai khoan tac gia co bi khoa hay khong
    if (!author || author.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const { user_id } = req.decoded_authorization as TokenPayload

    const user_id_objId = new ObjectId(user_id)

    const isInTwitterCircle = author.twitter_circle.some((user_circle_id) => user_circle_id.equals(user_id_objId))

    // Kiem tra nguoi xem tweet nay ko nam trong twitter_circle va ko phai la tac gia
    if (!isInTwitterCircle && !author._id.equals(user_id_objId)) {
      throw new ErrorWithStatus({
        message: TWEETS_MESSAGES.TWEET_IS_NOT_PUBLIC,
        status: HTTP_STATUS.FORBIDDEN
      })
    }
  }

  next()
}

// GET CHILDREN TWEET
export const getTweetChildrenValidator = validate(
  checkSchema(
    {
      tweet_type: {
        isIn: {
          options: [tweetTypess],
          errorMessage: TWEETS_MESSAGES.INVALID_TYPE
        }
      },
      limit: {
        isNumeric: true,
        custom: {
          options: async (value, { req }) => {
            const num = Number(value)

            if (num > 100 && num > 1) {
              throw new Error('Maximum is 100 and minimum is 1')
            }

            return true
          }
        }
      },
      page: {
        isNumeric: true,
        custom: {
          options: async (value, { req }) => {
            const num = Number(value)

            if (num > 1) {
              throw new Error('Minimum is 1')
            }

            return true
          }
        }
      }
    },
    ['query']
  )
)
