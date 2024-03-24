const _ = require("lodash");
const { Types } = require("mongoose");
const { findProductByIdAdmin, findProductById } = require("../services/product.service");
const productModel = require("../models/product.model");

const convertToObjectId = (id) => {
  return new Types.ObjectId(id);
};
const getInfoData = ({ fileds = [], object = {} }) => {
  return _.pick(object, fileds);
};
const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((item) => [item, 1]));
};
const unSelectData = (select = []) => {
  return Object.fromEntries(select.map((item) => [item, 0]));
};
const isEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}

const removeUndefined = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] === undefined || obj[key] === null) {
      delete obj[key];
    }
  });
  return obj;
};
const updateNestedObjectParse = (obj) => {
  console.log("🚀 ~ updateNestedObjectParse ~ obj:", obj);
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
const ValidateProductBeforeAddToCart = async (products) => {
  const listProduct = [];
  for (const product of products) {
    if (!listProduct[product.shopId]) {
      listProduct[product.shopId] = {
        shopId: product.shopId,
        shop_discount: [],
        item_product: []
      };
    }

    let productDetails = await findProductById(product.productId);
    if (productDetails.product_quantity <= 0) {
      throw new Error(`${productDetails._id} is out of stock`)
    } else {
      listProduct[product.shopId].item_product.push({
        productId: product.productId,
        quantity: product.quantity,
        product_name: productDetails.product_name,
        product_price: productDetails.product_price
      });
    }

  }
  return  Object.values(listProduct)
}

module.exports = {
  ValidateProductBeforeAddToCart,
  updateNestedObjectParse,
  getInfoData,
  unSelectData,
  getSelectData,
  removeUndefined,
  convertToObjectId,
  isEmail
};
