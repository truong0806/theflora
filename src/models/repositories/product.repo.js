"use strict";

const { Types } = require("mongoose");
const { product } = require("../product.model");

const findProductDraftsForShop = async (product_shop,{ query, limit, skip }) => {
  const foundProduct = await product
    .find({product_shop: new Types.ObjectId(product_shop), query})
    .populate("product_shop", "name email -_id")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
  console.log("🚀 ~ findProductDraftsForShop ~ foundProduct:", foundProduct);
  return await product;
};
const publishProductByyShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: Types.ObjectId(product_id),
  });
  (foundShop.isDraft = false), (foundShop.isPublished = true);
};

module.exports = {
  findProductDraftsForShop,
  publishProductByyShop,
};
