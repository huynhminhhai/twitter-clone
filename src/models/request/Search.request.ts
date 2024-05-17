import { PaginationRequestParams } from '~/models/request/Tweet.request'

export interface SearchRequestQuery extends PaginationRequestParams {
  content: string
}
