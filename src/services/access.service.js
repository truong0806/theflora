"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcryptjs");
const { generateKeyPairSync } = require("crypto");

const RoleShop = {
  ADMIN: "000",
  WRITE: "001",
  EDIT: "002",
  SHOP: "003",
};

class AccessService {
  static async signUp({ name, email, password }) {
    try {
      const holderShop = await shopModel.find({ email }).lean();
      if (holderShop) {
        return {
          code: "4001",
          message: "Email already exists",
          staus: "error",
        };
      }
      const hashPassword = await bcrypt.hash(password, 10);
      const newShop = await shopModel.create({
        name,
        email,
        password: hashPassword,
        rule: [RoleShop.SHOP],
      });

      if (newShop) {
        const { privateKey, publicKey } = await generateKeyPairSync({
          modulusLength: 4096,
        });
        console.log({ privateKey, publicKey });
      }

      const token = await user.generateAuthToken();
      res.status(201).send({ user, token });
    } catch (error) {
      return {
        code: "4001",
        message: "Sign up failed",
        staus: error,
      };
    }
  }
}

module.exports = AccessService;
