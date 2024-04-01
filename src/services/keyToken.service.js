"use strict";

const { Types } = require("mongoose");
const { ForbiddenError } = require("../core/error.response");
const keyTokenModel = require("../models/key.model");
const moment = require("moment");
class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    refreshToken,
    userIp,
  }) => {
    try {
      const filter = { user: userId };
      const update = {
        publicKey,
        $push: {
          logged: {
            $each: [
              `${moment(new Date()).format("DD/MM/YYYY")},${moment(
                new Date()
              ).format("HH:mm:ss")},${userIp},`,
            ],
            $slice: -3,
          },
        },
        refreshToken,
      };
      const options = { upsert: true, new: true };
      const tokens = await keyTokenModel.findOneAndUpdate(
        filter,
        update,
        options
      );
      return tokens ? tokens.publicKey : null;
    } catch (error) {
      throw new ForbiddenError("keyStore error");
    }
  };
  static findPublicKeyByUserId = async (userId) => {
    const objKey = await keyTokenModel
      .findOne({ user: new Types.ObjectId(userId) })
      .lean();
    if (!objKey) throw new ForbiddenError("keyStore error");
    return objKey;
  };
  static removeKeyTokenByUserId = async (userId) => {
    const objKey = await keyTokenModel
      .findOneAndDelete({ user: new Types.ObjectId(userId) })
      .lean();
    return objKey;
  };
  static findByRefreshTokenUsed = async (refreshToken) => {
    return await keyTokenModel
      .findOne({ refreshTokenUsed: refreshToken })
      .lean();
  };
  static findByRefreshToken = async (refreshToken) => {
    return await keyTokenModel.findOne({ refreshToken });
  };
  static updateKeyToken = async ({
    userId,
    tokens,
    publicKey,
    refreshToken,
  }) => {
    const filter = { user: userId };
    const update = {
      publicKey,
      $push: {
        refreshTokenUsed: {
          $each: [refreshToken],
          $slice: -3,
        },
      },
      refreshToken: tokens.refreshToken,
    };
    const options = { upsert: true, new: true };
    return await keyTokenModel.findOneAndUpdate(filter, update, options);
  };
}

module.exports = KeyTokenService;
