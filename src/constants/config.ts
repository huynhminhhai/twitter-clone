import argv from 'minimist'
import dotenv from 'dotenv'

const option = argv(process.argv.slice(2))

export const isProduction = option.env === 'production'

dotenv.config({
  path: option.env ? `.env.${option.env}` : '.env'
})

export const envConfig = {
  port: (process.env.PORT as string) || 4000,
  host: process.env.HOST as string,
  client: process.env.CLIENT as string,
  dbName: process.env.DB_NAME as string,
  dbUserName: process.env.DB_USERNAME as string,
  dbPassword: process.env.DB_PASSWORD as string,
  // Collection
  dbUserCollection: process.env.DB_USERS_COLLECTION as string,
  dbRefreshTokenCollection: process.env.DB_REFRESH_TOKENS_COLLECTION as string,
  dbFollowerCollection: process.env.DB_FOLLOWERS_COLLECTION as string,
  dbTweetCollection: process.env.DB_TWEETS_COLLECTION as string,
  dbHashtagCollection: process.env.DB_HASHTAGS_COLLECTION as string,
  dbBookmarkCollection: process.env.DB_BOOKMARKS_COLLECTION as string,
  dbLikeCollection: process.env.DB_LIKES_COLLECTION as string,
  // Key token
  hashPasswordKey: process.env.KEY_SECRET as string,
  accessKeyToken: process.env.SECRET_TOKEN_ACCESS as string,
  refreshKeyToken: process.env.SECRET_TOKEN_REFRESH as string,
  emailKeyToken: process.env.SECRET_TOKEN_EMAIL as string,
  passwordKeyToken: process.env.SECRET_TOKEN_PASSWORD as string,
  // Expired
  accessKeyExpired: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
  refreshKeyExpired: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
  emailKeyExpired: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN as string,
  passwordKeyExpired: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN as string,
  // Oauth 2.0
  googleClientId: process.env.GOOGLE_CLIENT_ID as string,
  googleRedirectSecret: process.env.GOOGLE_REDIRECT_SECRET as string,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI as string,
  googleRedirectClient: process.env.GOOGLE_REDIRECT_CLIENT as string
}
