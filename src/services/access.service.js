"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { ForbiddenError } = require("../core/error.response");
const RoleShop = {
  ADMIN: "000",
  WRITE: "001",
  EDIT: "002",
  SHOP: "003",
};

class AccessService {
  static signUp = async ({ name, email, password }) => {
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
        roles: [RoleShop.SHOP],
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
        const keyStore = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
        });
        if (!keyStore) {
          throw new ForbiddenError("keyStore error");
        }
        const tokens = await createTokenPair(
          {
            userId: newShop._id,
            publicKey,
          },
          publicKey,
          privateKey
        );
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

  static signIn = async ({ email, password }) => {
    try {
      const holderShop = await shopModel.findOne({ email }).lean();
      if (!holderShop) {
        throw new ForbiddenError("Tài khoản không tồn tại");
      }
      const isMatch = await bcrypt.compare(password, holderShop.password);
      if (isMatch) {
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
        const publicKeyString = await KeyTokenService.createKeyToken({
          userId: holderShop._id,
          publicKey,
        });
        if (!publicKeyString) {
          throw new ForbiddenError("keyStore error");
        }
        const tokens = await createTokenPair(
          {
            userId: holderShop._id,
            publicKey,
          },
          publicKey,
          privateKey
        );
        return {
          code: "2001",
          message: "Sign in successfully",
          status: "success",
          data: {
            tokens,
            shop: getInfoData({
              fileds: ["_id", "name", "email"],
              object: holderShop,
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
}

module.exports = AccessService;
