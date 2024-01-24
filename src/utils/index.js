const _ = require("lodash");

const getInfoData = ({ fileds = [], object = {} }) => {
  return _.pick(object, fileds);
};
const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((item) => [item, 1]));
};
const unSelectData = (select = []) => {
  return Object.fromEntries(select.map((item) => [item, 0]));
};

const removeUndefined = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] === undefined || obj[key] === null) {
      delete obj[key];
    }
  });
  return obj;
};
const updateNestedObjectParse = (obj) => {
  console.log("🚀 ~ updateNestedObjectParse ~ obj:", obj)
  const final = {};
  Object.keys(obj).forEach((k) => {
    if (typeof obj[k] === "object" && !Array.isArray(obj[k])) {
      const response = updateNestedObjectParse(obj[k]);
      Object.keys(response).forEach((a) => {
        final[`${k}.${a}`] = response[a];
      });
      console.log("🚀 ~ Object.keys ~ final:", final);
    } else {
      final[k] = obj[k];
      console.log("🚀 ~ Object.keys ~ final:", final);
    }
  });
  console.log("🚀 ~ Object.keys ~ final:", final);
  return final;
};

module.exports = {
  updateNestedObjectParse,
  getInfoData,
  unSelectData,
  getSelectData,
  removeUndefined,
};
