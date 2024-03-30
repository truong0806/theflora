const { BadRequestError } = require('../core/error.response')
const { findCartById } = require('../models/repositories/cart.repo')
const { calculateTotalOrder } = require('../models/repositories/checkout.repo')
const { checkProduct } = require('../models/repositories/product.repo')
const { getDiscountAmount } = require('./discount.service')

class CheckoutFactory {
  static async checkoutReview({ cartId, userId, cart_products = [] }) {
    const foundCart = await findCartById(cartId)
    if (!foundCart) {
      throw new BadRequestError('Cart not found')
    }
    const checkout_order = {
        totalprice: 0,
        feeShip: 0,
        totalDiscount: 0,
        totalCheckout: 0,
      },
      shop_order_id_new = []

    //Sum the total price and fee
    for (const element of cart_products) {
      const { shopId, shop_discount = [], item_product = [] } = element
      const { totalPrice, checkProductServer } = await calculateTotalOrder(
        item_product,
      )
      const itemCheckout = {
        shopId,
        shop_discount,
        priceRaw: totalPrice,
        priceApplyDiscount: 0,
        item_product: checkProductServer,
      }
      if (shop_discount.length > 0) {
        const { totalPriceAfterDis = 0, discount = 0 } =
          await getDiscountAmount({
            code: shop_discount[0],
            userId,
            shopId,
            products: checkProductServer,
          })

        itemCheckout.priceApplyDiscount += totalPriceAfterDis
        checkout_order.totalDiscount += discount
      } else {
        checkout_order.totalCheckout += totalPrice
      }
      //Final total price
      checkout_order.totalCheckout += itemCheckout.priceApplyDiscount
      checkout_order.totalprice += totalPrice
      shop_order_id_new.push(itemCheckout)
    }
    return {
      cart_products,
      shop_order_id_new,
      checkout_order,
    }
  }
}
module.exports = CheckoutFactory
