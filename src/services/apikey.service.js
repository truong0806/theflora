const apiKeyModel = require("../models/apikey.model");
const crypto = require("crypto");

const findById = async (key) => {
  //   const newOj = apiKeyModel.create({
  //     key: crypto.randomBytes(16).toString("hex"),
  //     permissions: ["0000"],
  //   });
  //   console.log("🚀 ~ findById ~ newOj:", newOj);

  const objKey = await apiKeyModel.findOne({ key, status: true }).lean();
  return objKey;
};

module.exports = {
  findById,
};
