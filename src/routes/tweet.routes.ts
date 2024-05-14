import { Router } from 'express'
import { createTweetController, getDetailTweetController } from '~/controllers/tweet.controller'
import { createTweetValidator, tweetIdValidator } from '~/middlewares/tweets.middelwares'
import { accessTokenValidator, isUserLogginedValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const tweetRouter = Router()

/**
 * Desc: Create tweet
 * Path: /
 * Method: POST
 * Headers: { Authorization: Bearer <access_token> }
 * Body: TweetRequestBody
 */
tweetRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapRequestHandler(createTweetController)
)

/**
 * Desc: Get tweet detail
 * Path: /:tweet_id
 * Method: GET
 * Headers: { Authorization?: Bearer <access_token> }
 */
tweetRouter.get(
  '/:tweet_id',
  tweetIdValidator,
  isUserLogginedValidator(accessTokenValidator),
  isUserLogginedValidator(verifiedUserValidator),
  wrapRequestHandler(getDetailTweetController)
)

export default tweetRouter
