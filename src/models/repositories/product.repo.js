'use strict'

const { asyncHandler } = require('../../helpers/asyncHandler')
const {
  getSelectData,
  unSelectData,
  convertToObjectId,
} = require('../../utils')
const productModel = require('../product.model')
const { product } = require('../product.model')
const { Types } = require('mongoose')

const findProductShopByStatus = async ({ query, limit, skip }) => {
  const foundProduct = await product
    .find(query)
    .populate('product_shop', '_id name email')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec()
  return await foundProduct
}
const findAllProducts = async ({ limit, sort, page, filter, select }) => {
  console.log('🚀 ~ findAllProducts ~ limit:', limit)
  const skip = (page - 1) * limit
  const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
  const foundProduct = await product
    .find(filter)
    .populate('product_shop', 'name email -_id')
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean()
  const count = await foundProduct.length
  return { count, foundProduct }
}
const findProductByIdAdmin = async ({
  product_id,
  roles,
  unselect,
  select,
}) => {
  console.log("🚀 ~ product_id:", product_id)
  const isAdmin = roles.includes(process.env.PERMISSION_ADMIN)
  const o_id = convertToObjectId(product_id)
  console.log("🚀 ~ o_id:", o_id)
  if (isAdmin) {
    const foundProduct = await product
      .find({ _id: o_id })
      .select(select || unSelectData(unselect))
      .lean()
    return foundProduct
  } else {
    const filter = { _id: o_id, isPublished: true, isDraft: false }
    const foundProduct = await product
      .find(filter)
      .select(select || unSelectData(unselect))
      .lean()
    return foundProduct
  }
}
const findProductById = async ({ product_id, select }) => {

  return await product.findById(product_id).select(select).exec();
}
const findProductBySlug = async ({ slug, roles, unselect }) => {
  console.log('🚀 ~ findProductBySlug ~ slug:', slug)
  const isAdmin = roles.includes(process.env.PERMISSION_ADMIN)
  if (isAdmin) {
    const foundProduct = await product
      .find({ product_slug: slug })
      .select(unSelectData(unselect))
      .lean()
    return foundProduct
  } else {
    const filter = { product_slug: slug, isPublished: true, isDraft: false }
    const foundProduct = await product
      .find(filter)
      .select(unSelectData(unselect))
      .lean()
    return foundProduct
  }
}
const searchProductByKeySearch = async ({ keySearch }) => {
  const regexSearch = RegExp(keySearch)
  const foundProduct = await product
    .find(
      {
        isDraft: false,
        isPublished: true,
        $text: { $search: regexSearch },
      },
      { score: { $meta: 'textScore' } },
    )
    .sort({ score: { $meta: 'textScore' } })
    .lean()
  return await foundProduct
}

const changeStatusProductShop = async ({ product_shop, product_id }) => {
  const filter = { product_shop, _id: product_id }
  const foundProduct = await product.findOne(filter)
  if (!foundProduct) {
    throw new BadRequestError('Product not found')
  }
  foundProduct.isDraft = !foundProduct.isDraft
  foundProduct.isPublished = !foundProduct.isPublished
  const updatedProduct = await foundProduct.save()
  return updatedProduct
}
const updateProductById = async ({ productId, bodyUpdate, model, isNew }) => {
  console.log('🚀 ~ product_id:', productId)
  const update = await model.findByIdAndUpdate(productId, bodyUpdate, {
    new: isNew,
  })
  return update
}

module.exports = {
  findProductShopByStatus,
  changeStatusProductShop,
  searchProductByKeySearch,
  findAllProducts,
  findProductById,
  findProductBySlug,
  updateProductById,
  findProductByIdAdmin,
}
