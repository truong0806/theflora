const { BadRequestError } = require('../../core/error.response')
const { ConvertToObjectId } = require('../../utils/mongoose/mongoose')
const discountModel = require('../discount.model')
const { product } = require('../product.model')

const findAllDiscountCode = async ({
  filter,
  limit,
  page,
  select,
  unSelect,
  model,
}) => {
  const foundDiscount = await model
    .find(filter)
    .limit(+limit)
    .skip(+page)
    .select(select || unSelectData(unSelect))
    .lean()
  const count = await foundDiscount.length
  return { count, foundDiscount }
}
const findDiscountByCode = async (code, shopId) => {
  const foundDiscount = await discountModel
    .findOne({
      discount_code: code,
      discount_shopId: ConvertToObjectId(shopId),
    })
    .lean()
  return foundDiscount
}
const findByIdAndUpdate = async (discount, userId) => {
  return await discountModel.findByIdAndUpdate(discount._id, {
    $pull: {
      discount_users_used: {
        userId: userId,
        used: 1,
      },
    },
    $inc: {
      discount_used_count: -1,
      discount_max_uses: 1,
    },
  })
}

const checkDiscountExists = async ({ model, filter }) => {
  const foundDiscount = await model.findOne(filter).lean()
  return foundDiscount
}

const validateDiscount = (discount, totalOrder) => {
  if (!discount.discount_is_active)
    throw new BadRequestError('Discount is expired')
  if (!discount.discount_max_uses)
    throw new BadRequestError('Discount codes are sold out')
  if (new Date() < new Date(discount.discount_start_date))
    throw new BadRequestError('Discount have not started yet')
  if (new Date() > new Date(discount.discount_end_date))
    throw new BadRequestError('Discount is expired')
  if (
    discount.discount_min_order_value > 0 &&
    (totalOrder < discount.discount_min_order_value ||
      (discount.discount_type === 'percentage' && discount.discount_value > 95))
  ) {
    throw new BadRequestError('Error discount code')
  }
}

const calculateTotalOrder = async (products) => {
  const fountProduct = await product
    .find({
      _id: { $in: products.map((item) => item.productId) },
    })
    .lean()
  return fountProduct.reduce((total, item) => {
    const foundItem = products.find(
      (product) => product.productId === item._id.toString(),
    )
    const { quantity } = foundItem
    return total + quantity * item.product_price
  }, 0)
}

const findUserUsedDiscount = async (discount_users_used, userId) => {
  return await discount_users_used.find((user) => user.userId === userId)
}

const calculateDiscountAmount = (
  discount_type,
  discount_value,
  discount_max_value,
  totalOrder,
) => {
  let amount, totalPrice
  if (discount_type === 'fix_amount') {
    if (discount_value > totalOrder) {
      amount = discount_value
      totalPrice = 0
    } else {
      amount = discount_value
      totalPrice = totalOrder - amount
    }
  } else {
    amount = (discount_value / 100) * totalOrder
    if (amount > discount_max_value) {
      amount = discount_max_value
    }
    totalPrice = totalOrder - amount
  }
  return { amount, totalPrice }
}

const updateDiscountUsedCount = async (foundDiscount, userId) => {
  console.log(
    '🚀 ~ updateDiscountUsedCount ~ foundDiscount:',
    foundDiscount._id,
  )
  let foundUser = await discountModel.findOne({
    _id: foundDiscount._id,
    'discount_users_used.userId': userId,
  })
  if (foundUser) {
    // Nếu userId đã tồn tại trong discount_users_used, tăng used lên 1
    await discountModel.updateOne(
      { _id: foundDiscount._id, 'discount_users_used.userId': userId },
      {
        $inc: {
          'discount_users_used.$.used': 1,
          discount_used_count: 1,
          discount_max_uses: -1,
        },
      },
    )
  } else {
    // Nếu userId chưa tồn tại trong discount_users_used, thêm mới
    await discountModel.updateOne(
      { _id: foundDiscount._id },
      {
        $push: {
          discount_users_used: {
            userId: userId,
            used: 1,
          },
        },
        $inc: {
          discount_used_count: 1,
          discount_max_uses: -1,
        },
      },
    )
  }
}

const getDiscountValue = (foundDiscount, discount_type) => {
  if (discount_type === 'fix_amount') {
    return foundDiscount.discount_value
  } else {
    return `${foundDiscount.discount_value}%`
  }
}

module.exports = {
  findDiscountByCode,
  checkDiscountExists,
  findAllDiscountCode,
  validateDiscount,
  calculateTotalOrder,
  calculateDiscountAmount,
  updateDiscountUsedCount,
  getDiscountValue,
  findUserUsedDiscount,
  findByIdAndUpdate,
}
