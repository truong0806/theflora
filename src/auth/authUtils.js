"use strict";

const JWT = require("jsonwebtoken");

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

module.exports = {
  createTokenPair,
};
