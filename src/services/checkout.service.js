const { BadRequestError } = require('../core/error.response')
const { findCartById } = require('../models/repositories/cart.repo')
const { calculateTotalOrder } = require('../models/repositories/discount.repo')
const { checkProduct } = require('../models/repositories/product.repo')

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
      const checkProductServer = await checkProduct({
        listProduct: item_product,
      })
      if (!checkProductServer[0])
        throw new BadRequestError('Something went wrong')

      //Calculate the total price
      const totalPrice = checkProductServer.reduce(
        (acc, product) => acc + product.price * product.quantity,
        0,
      )
      checkout_order.totalCheckout += totalPrice
      const itemCheckout = {
        shopId,
        shop_discount,
        priceRaw: totalPrice,
        priceApplyDiscount: totalPrice,
        item_product: checkProductServer,
      }
      if (shop_discount.length > 0) {
        const totalPrice = await calculateTotalOrder(checkProductServer)

      }
    }
  }
}
module.exports = CheckoutFactory
