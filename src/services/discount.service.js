const { BadRequestError } = require('../core/error.response')
const discount = require('../models/discount.model')
const { product } = require('../models/product.model')
const { calculateTotalOrder } = require('../models/repositories/checkout.repo')
const {
  findAllDiscountCode,
  findDiscountByCode,
  validateDiscount,
  calculateDiscountAmount,
  updateDiscountUsedCount,
  getDiscountValue,
  findByIdAndUpdate,
} = require('../models/repositories/discount.repo')
const { findAllProducts } = require('../models/repositories/product.repo')
const { ConvertToObjectId } = require('../utils/mongoose/mongoose')

class DiscountService {
  static async createDiscountCode({
    code,
    start_date,
    end_date,
    is_active,
    shopId,
    min_order_value,
    product_ids,
    applies_to,
    name,
    description,
    type,
    value,
    max_value,
    max_uses,
    used_count,
    max_uses_per_users,
    users_used,
  }) {
    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shopId: ConvertToObjectId(shopId),
      })
      .lean()
    if (foundDiscount) {
      throw new BadRequestError('Discount code already exists')
    }
    if (!['percent', 'fix_amount'].includes(type)) {
      throw new BadRequestError(`Discount type must be percent or fix_amount`)
    }

    if (type === 'percent') {
      if (value > 95) {
        throw new BadRequestError('Discount value must be less than 95%')
      }
    } else if (value > max_value) {
      throw new BadRequestError('Discount value must be less than max value')
    }

    const newDiscount = await discount.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_code: code,
      discount_value: value,
      discount_max_value: type === 'fix_amount' ? value : max_value,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses,
      discount_used_count: used_count,
      discount_users_used: users_used,
      discount_min_order_value: min_order_value,
      discount_shopId: ConvertToObjectId(shopId),
      discount_max_per_user: max_uses_per_users,
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: applies_to === 'all' ? [] : product_ids,
    })

    if (newDiscount) {
      return 'Discount code created'
    } else {
      throw new BadRequestError('Discount code could not be created')
    }
  }

  static async deleteDiscountCode(code, shopId) {
    const foundDiscount = await findDiscountByCode(code, shopId)
    if (!foundDiscount) throw new BadRequestError('Discount not exists')
    const deletedDiscount = await discount
      .findByIdAndDelete(foundDiscount._id)
      .lean()
    if (deletedDiscount) {
      return 'Discount code deleted'
    } else {
      throw new BadRequestError('Discount code could not be deleted')
    }
  }

  static async getAllDiscountCodeWithProduct({ shopId, code, limit, page }) {
    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shopId: ConvertToObjectId(shopId),
      })
      .lean()
    const { discount_is_active, discount_product_ids, discount_applies_to } =
      foundDiscount
    if (!foundDiscount || !discount_is_active) {
      throw new BadRequestError('Discount not exists')
    }
    let products
    if (discount_applies_to === 'all') {
      products = await findAllProducts({
        filter: {
          product_shop: ConvertToObjectId(shopId),
          // isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name'],
      })
    }
    if (discount_applies_to === 'specific') {
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          // isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name'],
      })
    }
    return products
  }
  static async getCodeByShop({ shopId, limit, page, is_active }) {
    const foundDiscount = await findAllDiscountCode({
      shopId,
      filter: {
        discount_shopId: ConvertToObjectId(shopId),
      },
      limit: +limit,
      page: +page,
      unSelect: ['__v', 'discount_shopId'],
      model: discount,
    })
    if (is_active === true) {
      const activeDiscount = await foundDiscount.foundDiscount.filter(
        (item) => item.discount_is_active === true,
      )
      return { count: activeDiscount.length, activeDiscount }
    }
    if (is_active === false) {
      const unActiveDiscount = await foundDiscount.foundDiscount.filter(
        (item) => item.discount_is_active === false,
      )
      return { count: unActiveDiscount.length, unActiveDiscount }
    }
    if (is_active === undefined || is_active === '') {
      return foundDiscount
    }
  }

  static async getDiscountAmount({ code, userId, shopId, products }) {
    if (products.length === 0) throw new BadRequestError('Products is empty')
    const foundDiscount = await findDiscountByCode(code, shopId)
    if (!foundDiscount) throw new BadRequestError('Discount code not exists')
    const {
      discount_max_per_user,
      discount_users_used,
      discount_type,
      discount_max_value,
      discount_product_ids,
      discount_value,
    } = foundDiscount

    validateDiscount(foundDiscount)
    if (discount_max_per_user > 0 && discount_users_used.length > 0) {
      const userUserDiscount = await discount_users_used.find(
        (user) => user.userId === userId,
      )
      if (userUserDiscount) {
        if (userUserDiscount.used >= discount_max_per_user) {
          throw new BadRequestError(
            `You have reached the maximum number of uses for this discount code`,
          )
        }
      }
    }

    const totalPriceApplyDiscount = await products.reduce(
      (acc, product) => {
        let totalDiscount = 0
        if (discount_product_ids.includes(product.productId)) {
          const priceAfterApplyDis = calculateDiscountAmount(
            discount_type,
            discount_value,
            discount_max_value,
            product.price * product.quantity,
          )
          totalDiscount += priceAfterApplyDis.amount
          acc.totalPriceDis += priceAfterApplyDis.totalPrice
        } else {
          acc.totalPriceDis += product.price * product.quantity
        }
        acc.totalDiscount += totalDiscount
        return acc
      },
      { totalDiscount: 0, totalPriceDis: 0 },
    )

    return {
      type: discount_type,
      discount: totalPriceApplyDiscount.totalDiscount,
      discountMax: discount_max_value,
      totalPriceAfterDis: totalPriceApplyDiscount.totalPriceDis,
    }
  }

  static async cancelDiscountCode({ code, userId, shopId }) {
    const foundDiscount = await findDiscountByCode(code, shopId)
    const { discount_users_used } = foundDiscount
    if (!foundDiscount) throw new BadRequestError('Discount not exists')
    const userUserDiscount = await discount_users_used.find(
      (user) => user.userId === userId,
    )
    let result
    if (userUserDiscount) {
      if (userUserDiscount.used === 1) {
        result = await findByIdAndUpdate(foundDiscount, userId)
      }
      if (userUserDiscount.used > 1) {
        await discount.updateOne(
          { _id: foundDiscount._id, 'discount_users_used.userId': userId },
          {
            $inc: {
              'discount_users_used.$.used': -1,
              discount_used_count: -1,
              discount_max_uses: 1,
            },
          },
        )
      }
    } else {
      throw new BadRequestError('Discount code not exists')
    }
    return result
  }
}

module.exports = DiscountService
