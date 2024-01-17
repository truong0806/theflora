'use strict';
const keyTokenModel = require("../models/key.model");

class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey, refreshToken }) => {
    console.log("🚀 ~ KeyTokenService ~ createKeyToken= ~ publicKey:", publicKey)
    try {
      const publicKeyString = publicKey.toString();
      const tokens = await keyTokenModel.create({
        user: userId,
        publicKey: publicKeyString,
      });
      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return {
        code: "4001",
        message: "Create key token failed",
        staus: error,
      };
    }
  };
}

module.exports = KeyTokenService;
