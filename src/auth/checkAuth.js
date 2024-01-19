const { AuthFailureError, NotFoundError } = require("../core/error.response");
const { asyncHandler } = require("../helpers/asyncHandler");
const { findById } = require("../services/apikey.service");
const { findPublicKeyByUserId } = require("../services/keyToken.service");
const JWT = require("jsonwebtoken");
const { JWTVerify } = require("./authUtils");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
};

const apiKey = async (req, res, next) => {
  try {
    const key = req.headers[HEADER.API_KEY]?.toString();
    console.log("🚀 ~ apiKey ~ key:", key);

    if (!key) {
      return res.status(401).json({
        code: "401",
        message: "Forbidden",
      });
    }
    //check key obj
    const objKey = await findById(key);
    if (!objKey) {
      return res.status(403).json({
        code: "403",
        message: "Forbidden",
      });
    }
    req.objKey = objKey;
    return next();
  } catch (error) {
    console.log(error);
  }
};

const permission = (permission) => {
  return async (req, res, next) => {
    console.log("🚀 ~ return ~ req:", req.body.refeshToken);
    const userIp =
      req.socket.remoteAddress ||
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress;
    req.body.userIp = userIp ? userIp.replace("::ffff:", "") : "";
    if (!req.objKey.permissions) {
      return res.status(403).json({
        code: "403",
        message: "permission denied",
      });
    }
    const isPermission = await req.objKey.permissions.includes(permission);
    console.log("🚀 ~ return ~ isPermission:", isPermission);
    if (!isPermission) {
      return res.status(403).json({
        code: "403",
        message: "permission denied",
      });
    }
    return next();
  };
};
const authentication = asyncHandler(async (req, res, next) => {
  const userId = req.headers[HEADER.CLIENT_ID]?.toString();
  console.log("🚀 ~ authentication ~ userId:", userId);
  if (!userId) {
    throw new AuthFailureError("Authentication error");
  }
  const token = req.headers[HEADER.AUTHORIZATION]
    ?.toString()
    .replace("Bearer ", "");
  if (!token) {
    throw new NotFoundError("Token not found");
  }
  const keyStore = await findPublicKeyByUserId(userId);
  if (!keyStore) {
    throw new NotFoundError("KeyStore not found");
  }
  try {
    const decode = JWTVerify(token, keyStore.publicKey);
    //const decode = JWT.verify(token, keyStore.publicKey);
    if (!decode) {
      throw new AuthFailureError("Authentication error");
    }
    if (userId !== decode.userId) {
      throw new AuthFailureError("Authentication error");
    }
    req.keyStore = decode;
    return next();
  } catch (error) {
    console.log("🚀 ~ authentication ~ error:", error)
    throw error;
  }
});

module.exports = {
  apiKey,
  permission,
  authentication,
};
