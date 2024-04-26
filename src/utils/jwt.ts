import jwt from 'jsonwebtoken'

export const signToken = ({
  payload,
  privateKey = process.env.KEY_SECRET as string,
  options = {
    algorithm: 'HS256'
  }
}: {
  payload: string | Buffer | object
  privateKey?: string
  options?: jwt.SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if (error) {
        throw reject(error)
      }

      resolve(token as string)
    })
  })
}
