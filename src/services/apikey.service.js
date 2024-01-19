const apiKeyModel = require("../models/apikey.model");
const crypto = require("crypto");

const findById = async (key) => {
  const objKey = await apiKeyModel.findOne({ key, status: true }).lean();
  return objKey;
};
const createapikey = async (permissions) => {
  const newOj = apiKeyModel.create({
    key: crypto.randomBytes(16).toString("hex"),
    permissions: permissions,
  });
  return newOj;
};

module.exports = {
  findById,
  createapikey,
};
