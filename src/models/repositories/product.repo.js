"use strict";

const { Types } = require("mongoose");
const { product } = require("../product.model");
const { filter, update } = require("lodash");

const findProductDraftsForShop = async ({ query, limit, skip }) => {
  const foundProduct = await product
    .find(query)
    .populate("product_shop", "name email -_id")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
  return await foundProduct;
};
const findProductPublishForShop = async ({ query, limit, skip }) => {
  const foundProduct = await product
    .find(query)
    .populate("product_shop", "name email -_id")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
  return await foundProduct;
};

const changeStatusProductShop = async ({ product_shop, product_id }) => {
  const filter = { product_shop, _id: product_id };
  const foundProduct = await product.findOne(filter);
  if (!foundProduct) {
    throw new BadRequestError("Product not found");
  }
  foundProduct.isDraft = !foundProduct.isDraft;
  foundProduct.isPublished = !foundProduct.isPublished;
  const updatedProduct = await foundProduct.save();
  return updatedProduct;
};

module.exports = {
  findProductDraftsForShop,
  changeStatusProductShop,
  findProductPublishForShop,
};
