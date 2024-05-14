import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { LIKE_MESSAGES } from '~/constants/messages'
import { LikeRequestBody } from '~/models/request/Like.request'
import { TokenPayload } from '~/models/request/User.request'
import likeService from '~/services/like.services'

export const likesController = async (req: Request<ParamsDictionary, any, LikeRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const tweet_id = req.body.tweet_id

  const result = await likeService.likeTweet(user_id, tweet_id)

  res.json({
    message: LIKE_MESSAGES.LIKE_SUCCESSFULLY,
    data: result
  })
}

export const unLikesController = async (req: Request<{ tweet_id: string }>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const tweet_id = req.params.tweet_id

  const result = await likeService.unLikeTweet(user_id, tweet_id)

  res.json({
    message: LIKE_MESSAGES.LIKE_SUCCESSFULLY,
    data: result
  })
}
