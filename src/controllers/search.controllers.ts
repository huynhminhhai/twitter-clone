import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { SearchRequestQuery } from '~/models/request/Search.request'
import { TokenPayload } from '~/models/request/User.request'
import searchSevice from '~/services/search.services'

// SEARCH
export const searchController = async (req: Request<ParamsDictionary, any, any, SearchRequestQuery>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await searchSevice.search(req.query, user_id)

  res.json({
    message: 'Seacrh successfully',
    data: { ...result, totalPage: Math.ceil(result.totalPage / result.limit) }
  })
}
