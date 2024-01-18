"use strict";

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
    console.log("🚀 ~ KeyTokenService ~ refreshToken:", refreshToken);
    try {
      const filter = { user: userId };
      const update = {
        publicKey,
        $push: {
          refreshTokenUsed: {
            $each: [refreshToken],
            $slice: -3,
          },
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
}

module.exports = KeyTokenService;
