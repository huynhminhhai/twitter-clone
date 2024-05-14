import { Router } from 'express'
import { bookmarksController, unBookmarksController } from '~/controllers/bookmarks.controllers'
import { tweetIdValidator } from '~/middlewares/tweets.middelwares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const bookmarksRouter = Router()

/**
 * Desc: Bookmark Tweet
 * Path: /
 * Method: POST
 * Headers: { Authorization: Bearer <access_token> }
 * Body: { tweet_id: string }
 */
bookmarksRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(bookmarksController)
)

/**
 * Desc: Un Bookmark Tweet
 * Path: /:tweet_id
 * Method: DELETE
 * Headers: { Authorization: Bearer <access_token> }
 */
bookmarksRouter.delete(
  '/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unBookmarksController)
)

export default bookmarksRouter
