import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { BOOKMARK_MESSAGES } from '~/constants/messages'
import { BookmarkRequestBody } from '~/models/request/Bookmark.request'
import { TokenPayload } from '~/models/request/User.request'
import bookmarkService from '~/services/bookmark.services'

export const bookmarksController = async (req: Request<ParamsDictionary, any, BookmarkRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const tweet_id = req.body.tweet_id

  const result = await bookmarkService.bookmark(user_id, tweet_id)

  res.json({
    message: BOOKMARK_MESSAGES.BOOKMARK_SUCCESSFULLY,
    data: result
  })
}

export const unBookmarksController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const tweet_id = req.params.tweet_id

  const result = await bookmarkService.unBookmark(user_id, tweet_id)

  res.json({
    message: BOOKMARK_MESSAGES.UNBOOKMARK_SUCCESSFULLY,
    data: result
  })
}
