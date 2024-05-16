import { TweetAudience, TweetTypes } from '~/constants/enums'
import { Media } from '~/models/Others'

export interface TweetRequestBody {
  type: TweetTypes
  audience: TweetAudience
  content: string
  parent_id: null | string //  chỉ null khi tweet gốc, không thì là tweet_id cha dạng string
  hashtags: string[] // tên của hashtag dạng ['javascript', 'reactjs']
  mentions: string[] // user_id[]
  medias: Media[]
}

export interface PaginationRequestParams {
  limit: number
  page: number
}
