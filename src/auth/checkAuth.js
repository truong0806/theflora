const { AuthFailureError, NotFoundError } = require('../core/error.response')
const { asyncHandler } = require('../helpers/asyncHandler')
const { findById } = require('../services/apikey.service')
const KeyTokenService = require('../services/keyToken.service')
const { findPublicKeyByUserId } = require('../services/keyToken.service')
const { JWTVerify } = require('./authUtils')

const HEADER = {
  API_KEY: 'x-api-key',
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization',
  REFRESHTOKEN: 'x-rtoken-id',
}

const apiKey = async (req, res, next) => {
  try {
    const key = req.headers[HEADER.API_KEY]?.toString()
    console.log('🚀 ~ apiKey ~ key:', key)

    if (!key) {
      return res.status(401).json({
        code: '401',
        message: 'Forbidden',
      })
    }
    //check key obj
    const objKey = await findById(key)
    if (!objKey) {
      return res.status(403).json({
        code: '403',
        message: 'Forbidden',
      })
    }
    req.objKey = objKey
    return next()
  } catch (error) {
    console.log(error)
  }
}

const permission = (permission) => {
  return async (req, res, next) => {
    try {
      const userIp =
        req.socket.remoteAddress ||
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress
      req.body.userIp = userIp ? userIp.replace('::ffff:', '') : ''
      console.log(
        '🚀 ~ return ~ req.objKey.permissions:',
        req.objKey.permissions,
      )
      if (!req.objKey.permissions) {
        return res.status(403).json({
          code: '403',
          message: 'permission denied',
        })
      }
      const isPermission = await req.objKey.permissions.includes(permission)
      console.log('🚀 ~ return ~ isPermission1:', isPermission)
      if (!isPermission) {
        return res.status(403).json({
          code: '403',
          message: 'permission denied',
        })
      } else {
        return next()
      }
    } catch (error) {
      console.log('🚀 ~ return ~ error:', error)
    }
  }
}
const authenticationV2 = asyncHandler(async (req, res, next) => {
  const userId = req.headers[HEADER.CLIENT_ID]?.toString()
  console.log('🚀 ~ authenticationV2 ~ userId:', userId)
  if (!userId) {
    throw new AuthFailureError('Authentication error')
  }
  const keyStore = await findPublicKeyByUserId(userId)
  console.log('🚀 ~ authenticationV2 ~ keyStore:', keyStore)
  if (!keyStore) {
    throw new NotFoundError('KeyStore not found')
  }
  const token = req.headers[HEADER.AUTHORIZATION]
    ?.toString()
    .replace('Bearer ', '')
  if (!token) {
    throw new NotFoundError('Token not found')
  }
  try {
    const refreshToken = req.headers[HEADER.REFRESHTOKEN]?.toString()
    const decodeUser = JWTVerify(refreshToken, keyStore.publicKey)
    if (!decodeUser) {
      await KeyTokenService.removeKeyTokenByUserId(userId)
      throw new AuthFailureError('Something went wrong, please login again')
    }
    if (userId !== decodeUser.userId) {
      throw new AuthFailureError('Authentication error')
    }
    req.keyStore = keyStore
    console.log('🚀 ~ authenticationV2 ~ keyStore:', keyStore)
    req.user = decodeUser
    req.refreshToken = refreshToken
    return next()
  } catch (error) {
    throw error
  }
})
const authentication = asyncHandler(async (req, res, next) => {
  const userId = req.headers[HEADER.CLIENT_ID]?.toString()
  console.log('🚀 ~ authentication ~ userId:', userId)
  if (!userId) {
    throw new AuthFailureError('Authentication error')
  }
  const token = req.headers[HEADER.AUTHORIZATION]
    ?.toString()
    .replace('Bearer ', '')
  if (!token) {
    throw new NotFoundError('Token not found')
  }
  const keyStore = await findPublicKeyByUserId(userId)
  if (!keyStore) {
    throw new NotFoundError('KeyStore not found')
  }
  try {
    const decode = JWTVerify(token, keyStore.publicKey)
    if (!decode) {
      throw new AuthFailureError('Authentication error')
    }
    if (userId !== decode.userId) {
      throw new AuthFailureError('Authentication error')
    }
    req.keyStore = decode
    req.user = decode
    return next()
  } catch (error) {
    console.log('🚀 ~ authentication ~ error:', error)
    throw error
  }
})

module.exports = {
  apiKey,
  permission,
  authentication,
  authenticationV2,
}
