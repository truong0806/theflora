"use strict";

const JWT = require("jsonwebtoken");
const crypto = require("node:crypto");
const { ForbiddenError } = require("../core/error.response");
const createTokenPair = async (payload, privateKey) => {
  try {
    // accessToken
    const accessToken = JWT.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "2 days",
    });

    const refreshToken = JWT.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "7 days",
    });
    //
    // JWT.verify(accessToken, publicKey, (err, decode) => {
    //   if (err) {
    //     console.error(`error verify::`, err);
    //   } else {
    //     console.log(`decode verify::`, decode);
    //   }
    // });
    return { accessToken, refreshToken };
  } catch (error) {}
};
const JWTVerify = (token, publicKey) => {
  try {
    const decode = JWT.verify(token, publicKey);
    return decode;
  } catch (error) {
    throw new ForbiddenError("Something went wrong, please login again");
  }
};
const generateKeyPairSync = () => {
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
  return { publicKey, privateKey };
};
module.exports = {
  createTokenPair,
  JWTVerify,
  generateKeyPairSync,
};
