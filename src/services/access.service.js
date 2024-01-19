"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { findByEmail } = require("./shop.service");
const {
  createTokenPair,
  generateKeyPairSync,
  JWTVerify,
} = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { ForbiddenError, AuthFailureError } = require("../core/error.response");

const RoleShop = {
  ADMIN: "0000",
  WRITE: "1111",
  EDIT: "2222",
  SHOP: "3333",
};

class AccessService {
  static signUp = async ({ name, email, password, userIp }) => {
    try {
      const holderShop = await shopModel.findOne({ email }).lean();
      if (holderShop) {
        throw new ForbiddenError("Email đã tồn tại");
      }
      const hashPassword = await bcrypt.hash(password, 10);
      const newShop = await shopModel.create({
        name,
        email,
        password: hashPassword,
        roles: [RoleShop.WRITE],
      });

      if (newShop) {
        const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
          modulusLength: 2048,
          publicKeyEncoding: {
            type: "spki",
            format: "pem",
          },
          privateKeyEncoding: {
            type: "pkcs8",
            format: "pem",
          },
        });
        const { _id: userId } = newShop;

        const tokens = await createTokenPair(
          {
            userId,
            email,
          },
          privateKey
        );
        const publicKeyString = await KeyTokenService.createKeyToken({
          userId,
          publicKey,
          refreshToken: tokens.refreshToken,
          userIp,
        });
        if (!publicKeyString) {
          throw new ForbiddenError("keyStore error");
        }
        return {
          code: "2001",
          message: "Sign up successfully",
          status: "success",
          data: {
            tokens,
            shop: getInfoData({
              fileds: ["_id", "name", "email"],
              object: newShop,
            }),
          },
        };
      }
    } catch (error) {
      return {
        status: "error",
        code: error.statusCode || 500,
        message: error.message,
      };
    }
  };

  static signIn = async ({ email, password, refeshToken = null, userIp }) => {
    console.log("🚀 ~ AccessService ~ signIn= ~ userIp:", userIp);
    try {
      const foundShop = await findByEmail({ email });
      if (!foundShop) {
        throw new ForbiddenError("Shop not found");
      }
      const isMatch = await bcrypt.compare(password, foundShop.password);
      if (!isMatch) {
        throw new AuthFailureError("Password not match");
      }
      const { publicKey, privateKey } = generateKeyPairSync();
      const { _id: userId } = foundShop;
      const tokens = await createTokenPair(
        {
          userId,
          email,
        },
        privateKey
      );
      const publicKeyString = await KeyTokenService.createKeyToken({
        userId,
        publicKey,
        refreshToken: tokens.refreshToken,
        userIp,
      });
      if (!publicKeyString) {
        throw new ForbiddenError("keyStore error");
      }

      return {
        code: "2001",
        message: "Sign in successfully",
        status: "success",
        data: {
          tokens,
          shop: getInfoData({
            fileds: ["_id", "name", "email"],
            object: foundShop,
          }),
        },
      };
    } catch (error) {
      return {
        status: "error",
        code: error.statusCode || 500,
        message: error.message,
      };
    }
  };

  static signOut = async ({ userId }) => {
    const delKey = await KeyTokenService.removeKeyTokenByUserId(userId);
    if (!delKey) {
      throw new ForbiddenError("keyStore error");
    }
    return {
      code: "2001",
      message: "Sign out successfully",
      status: "success",
    };
  };

  static handlerRefeshToken = async ({ refreshToken }) => {
    const keyToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken);
    console.log(
      "🚀 ~ AccessService ~ handlerRefeshToken= ~ keyToken:",
      keyToken
    );
    if (keyToken) {
      const { user } = keyToken;
      await KeyTokenService.removeKeyTokenByUserId(user);
      throw new ForbiddenError("Something went wrong, please login again");
    }
    const holderResfreshToken = await KeyTokenService.findByRefreshToken(
      refreshToken
    );
    if (!holderResfreshToken) {
      throw new AuthFailureError("Shop not found");
    }
    const decode = JWTVerify(refreshToken, holderResfreshToken.publicKey);
    if (!decode) {
      throw new AuthFailureError("Authentication error");
    }
    const { userId, email } = decode;
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new ForbiddenError("Shop not found");
    }
    const { publicKey, privateKey } = generateKeyPairSync();
    const tokens = await createTokenPair(
      {
        userId,
        email,
      },
      privateKey
    );
    const updated = await KeyTokenService.updateKeyToken({
      userId,
      tokens,
      publicKey,
      refreshToken,
    });
    if (!updated) {
      throw new ForbiddenError("keyStore error");
    }
    return {
      code: "2001",
      status: "success",
      data: {
        tokens,
        shop: getInfoData({
          fileds: ["_id", "name", "email"],
          object: foundShop,
        }),
      },
    };
  };
}

module.exports = AccessService;
