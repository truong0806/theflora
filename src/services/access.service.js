'use strict'

const shopModel = require('../models/shop.model')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const KeyTokenService = require('./keyToken.service')
const { findByEmail } = require('./shop.service')
const {
  createTokenPair,
  generateKeyPairSync,
  JWTVerify,
} = require('../auth/authUtils')
const {  isEmail } = require('../utils')
const { ForbiddenError, AuthFailureError } = require('../core/error.response')
const { getInfoData, ConvertToObjectId } = require('../utils/mongoose/mongoose')

const RoleShop = {
  ADMIN: '0000',
  WRITE: '1111',
  EDIT: '2222',
  SHOP: '3333',
}

class AccessService {
  static signUp = async ({ name, email, password, userIp }) => {
    try {
      const holderShop = await shopModel.findOne({ email }).lean()
      if (holderShop) {
        throw new ForbiddenError('Email đã tồn tại')
      }
      const hashPassword = await bcrypt.hash(password, 10)
      const newShop = await shopModel.create({
        name,
        email,
        password: hashPassword,
        roles: [RoleShop.WRITE],
      })

      if (newShop) {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
          modulusLength: 2048,
          publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
          },
          privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
          },
        })
        const { _id: userId } = newShop

        const tokens = await createTokenPair(
          {
            userId,
            email,
          },
          privateKey,
        )
        const publicKeyString = await KeyTokenService.createKeyToken({
          userId,
          publicKey,
          refreshToken: tokens.refreshToken,
          userIp,
        })
        if (!publicKeyString) {
          throw new ForbiddenError('keyStore error')
        }
        return {
          code: '2001',
          message: 'Sign up successfully',
          status: 'success',
          data: {
            tokens,
            shop: getInfoData({
              fileds: ['_id', 'name', 'email'],
              object: newShop,
            }),
          },
        }
      }
    } catch (error) {
      return {
        status: 'error',
        code: error.statusCode || 500,
        message: error.message,
      }
    }
  }

  static signIn = async ({ email, password, refeshToken = null, userIp }) => {
    try {
      const foundShop = await findByEmail({ email })
      if (!foundShop) {
        throw new ForbiddenError('Shop not found')
      }
      const isMatch = await bcrypt.compare(password, foundShop.password)
      if (!isMatch) {
        throw new AuthFailureError('Password not match')
      }
      const { publicKey, privateKey } = generateKeyPairSync()
      const { _id: userId } = foundShop
      const tokens = await createTokenPair(
        {
          userId,
          email,
        },
        privateKey,
      )
      const publicKeyString = await KeyTokenService.createKeyToken({
        userId,
        publicKey,
        refreshToken: tokens.refreshToken,
        userIp,
      })
      if (!publicKeyString) {
        throw new ForbiddenError('keyStore error')
      }

      return {
        code: '2001',
        message: 'Sign in successfully',
        status: 'success',
        data: {
          tokens,
          shop: getInfoData({
            fileds: ['_id', 'name', 'email'],
            object: foundShop,
          }),
        },
      }
    } catch (error) {
      return {
        status: 'error',
        code: error.statusCode || 500,
        message: error.message,
      }
    }
  }

  static signOut = async (user) => {
    console.log('🚀 ~ AccessService ~ signOut= ~ userId:', user.userId)
    const delKey = await KeyTokenService.removeKeyTokenByUserId(user.userId)
    if (!delKey) {
      throw new ForbiddenError('keyStore error')
    }
    return {
      code: '2001',
      message: 'Sign out successfully',
      status: 'success',
    }
  }

  static handlerRefeshTokenV2 = async ({ refreshToken, user, keyStore }) => {
    console.log('🚀 ~ AccessService ~ handlerRefeshTokenV2= ~ user:', user)
    const { userId, email } = user
    if (keyStore.refreshTokenUsed.includes(refreshToken)) {
      await KeyTokenService.removeKeyTokenByUserId(userId)
      throw new ForbiddenError('Something went wrong, please login again')
    }
    if (keyStore.refreshToken !== refreshToken) {
      throw new ForbiddenError('Something went wrong, please login again 1')
    }
    const foundShop = await findByEmail({ email })
    if (!foundShop) {
      throw new ForbiddenError('Shop not found')
    }
    const { publicKey, privateKey } = generateKeyPairSync()
    const tokens = await createTokenPair(
      {
        userId,
        email,
      },
      privateKey,
    )
    const updated = await KeyTokenService.updateKeyToken({
      userId,
      tokens,
      publicKey,
      refreshToken,
    })
    if (!updated) {
      throw new ForbiddenError('keyStore error')
    }
    return {
      code: '2001',
      status: 'success',
      data: {
        tokens,
        user,
      },
    }
  }
  static getShop = async ({ _end, _order, _sort, _start, q }) => {
    try {
      const limit = _end - _start
      const skip = _start
      const sort = { [_sort]: _order === 'DESC' ? -1 : 1 }
      const filter = q
        ? isEmail(q)
          ? { email: q }
          : { name: { $regex: q, $options: 'i' } }
        : {}
      const shop = await shopModel
        .find(filter)
        .limit(limit)
        .skip(skip)
        .sort(sort)
        .select(unSelectData(['__v', 'password']))
        .lean()
      const count = await shopModel.countDocuments()
      console.log('🚀 ~ AccessService ~ getShop= ~ count:', count)
      return { count, shop }
    } catch (error) {
      return {
        status: 'error',
        code: error.statusCode || 500,
        message: error.message,
      }
    }
  }
  static deleteShop = async ( id ) => {
    console.log("🚀 ~ AccessService ~ staticdeleteShop ~ id:", id)
    try {
      const deletedShop = await shopModel.findByIdAndDelete(ConvertToObjectId(id))
      if (!deletedShop) {
        throw new ForbiddenError('Shop not found')
      }
      return {
        code: '2001',
        message: 'Delete shop successfully',
        status: 'success',
      }
    } catch (error) {
      return {
        status: 'error',
        code: error.statusCode || 500,
        message: error.message,
      }
    }
  }
}

module.exports = AccessService
