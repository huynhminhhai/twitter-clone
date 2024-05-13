import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetTypes } from '~/constants/enums'
import { TWEETS_MESSAGES } from '~/constants/messages'
import { numberEnumToArray } from '~/utils/others'
import { validate } from '~/utils/validation'

const tweetTypess = numberEnumToArray(TweetTypes)

const audienceTypes = numberEnumToArray(TweetAudience)

const mediaTypes = numberEnumToArray(MediaType)

export const createTweetValidator = validate(
  checkSchema({
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
  })
)
