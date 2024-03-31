const { BadRequestError } = require('../core/error.response')
const { cart } = require('../models/cart.model')
const { order } = require('../models/order.model')
const { findCartById } = require('../models/repositories/cart.repo')
const { calculateTotalOrder } = require('../models/repositories/checkout.repo')
const { checkProduct } = require('../models/repositories/product.repo')
const { getDiscountAmount } = require('./discount.service')
const { acquireLock, releaseLock } = require('./redis.service')

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
      cart_products_new = []

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
      cart_products_new.push(itemCheckout)
    }
    return {
      cart_products,
      cart_products_new,
      checkout_order,
    }
  }
  static async finalOrderByUser({
    cart_products_new,
    cartId,
    userId,
    user_address = {},
    user_payment = {},
  }) {
    const { checkout_order } = await CheckoutFactory.checkoutReview({
      cartId,
      userId,
      cart_products: cart_products_new,
    })
    const products = await cart_products_new.flatmap(
      (item) => item.item_product,
    )
    const acquireProduct = []
    for (const product of products) {
      const { productId, quantity } = product
      const keylock = await acquireLock(productId, quantity, cartId)
      acquireProduct.push(Boolean(keylock))
      if (keylock) {
        await releaseLock(keylock)
      }
    }
    if (acquireProduct.includes(false)) {
      throw new BadRequestError('Some products are not available')
    }
    const newOrder = order.create({
      order_userrId: userId,
      order_checkout: checkout_order,
      order_shipping: user_address,
      order_payment: user_payment,
      order_products: cart_products_new,
    })
    if (newOrder) {
      await cart.deleteOne({ _id: cartId })
    }
    return newOrder
  }
}
module.exports = CheckoutFactory
