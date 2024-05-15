import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TWEETS_MESSAGES } from '~/constants/messages'
import { TweetRequestBody } from '~/models/request/Tweet.request'
import { TokenPayload } from '~/models/request/User.request'
import tweetService from '~/services/tweets.services'

// CREATE TWEET
export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await tweetService.createTweet(user_id, req.body)

  res.json({
    message: TWEETS_MESSAGES.CREATE_TWEET_SUCCESS,
    data: result
  })
}

// GET DETAIL TWEET
export const getDetailTweetController = async (req: Request<{ tweet_id: string }>, res: Response) => {
  const result = await tweetService.increaseView(req.params.tweet_id, req.decoded_authorization?.user_id)

  const tweet = {
    ...req.tweet,
    user_views: result?.user_views,
    guest_views: result?.guest_views
  }

  res.json({
    message: TWEETS_MESSAGES.GET_TWEET_DETAIL,
    data: tweet
  })
}
