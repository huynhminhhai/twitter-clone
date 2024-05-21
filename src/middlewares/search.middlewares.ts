import { checkSchema } from 'express-validator'
import { MediaTypeQuery } from '~/constants/enums'
import { validate } from '~/utils/validation'

// SEARCH
export const searchValidator = validate(
  checkSchema(
    {
      content: {
        isString: {
          errorMessage: 'Content must be string'
        }
      },
      media_type: {
        optional: true,
        isIn: {
          options: [Object.values(MediaTypeQuery)]
        },
        errorMessage: `Media type must be one of ${Object.values(MediaTypeQuery).join(', ')}`
      }
    },
    ['query']
  )
)
