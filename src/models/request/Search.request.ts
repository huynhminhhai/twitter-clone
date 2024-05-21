import { MediaTypeQuery } from '~/constants/enums'
import { PaginationRequestParams } from '~/models/request/Tweet.request'

export interface SearchRequestQuery extends PaginationRequestParams {
  content: string
  media_type: MediaTypeQuery
}
