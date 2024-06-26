import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TWEETS_MESSAGES } from '~/constants/messages'
import { PaginationRequestParams, TweetRequestBody } from '~/models/request/Tweet.request'
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
    guest_views: result?.guest_views,
    updated_at: result?.updated_at
  }

  res.json({
    message: TWEETS_MESSAGES.GET_TWEET_DETAIL,
    data: tweet
  })
}

// GET CHILDREN TWEET
export const getChildrenTweetController = async (req: Request<{ tweet_id: string }>, res: Response) => {
  const tweet_type = Number(req.query.tweet_type)

  const limit = Number(req.query.limit)

  const page = Number(req.query.page)

  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await tweetService.getChildrenTweet(req.params.tweet_id, tweet_type, limit, page, user_id)

  res.json({
    message: TWEETS_MESSAGES.GET_TWEET_CHILDREN,
    data: {
      tweets: result.tweets,
      tweet_type,
      limit,
      page,
      totalPage: Math.ceil(result.total / limit)
    }
  })
}

// GET NEWFEEd
export const getNewFeedConroller = async (
  req: Request<ParamsDictionary, any, PaginationRequestParams>,
  res: Response
) => {
  const limit = Number(req.query.limit)

  const page = Number(req.query.page)

  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await tweetService.getNewFeed(user_id, limit, page)

  res.json({
    message: 'Get newfeed successfully',
    data: { ...result, limit, page, totalPage: Math.ceil(result.totalPage / limit) }
  })
}
