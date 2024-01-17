const { findById } = require("../services/apikey.service");

const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "authorization",
};

const apiKey = async (req, res, next) => {
  try {
    const key = req.headers[HEADER.API_KEY]?.toString();
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
    console.log("🚀 ~ apiKey ~ req.objKey:", req.objKey);
    return next();
  } catch (error) {
    console.log(error);
  }
};

const permission = (permission) => {
  return (req, res, next) => {
    if (!req.objKey.permissions) {
      return res.status(403).json({
        code: "403",
        message: "permission denied",
      });
    }
    console.log("🚀 ~ permission ~ permission:", permission);
    const isPermission = req.objKey.permissions.includes(permission);
    if (!isPermission) {
      return res.status(403).json({
        code: "403",
        message: "permission denied",
      });
    }
    return next();
  };
};

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = {
  apiKey,
  permission,
  asyncHandler,
};
