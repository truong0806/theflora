const cartModel = require('../models/cart.model')
const { findProductById } = require('../models/repositories/product.repo')
const { convertToObjectId } = require('../utils')

class CartService {
  static async createCart(userId, products) {
    console.log('🚀 ~ CartService ~ createCart ~ product:', products)
    const listProduct = await this.findProductAfterAddToCart(products)
    const query = {
        cart_userId: userId,
        cart_state: 'active',
      },
      updateOrInsert = {
        $push: { cart_products: listProduct },
        $inc: { cart_count_product: 1 },
      },
      options = { upsert: true, new: true }
    return await cartModel.findOneAndUpdate(query, updateOrInsert, options)
  }

  static async updateCartProductQuantity(userId, product) {
    console.log(
      '🚀 ~ CartService ~ updateCartProductQuantity ~ product:',
      product,
    )
    for (const item of product) {
      const query = {
          cart_userId: userId,
          'cart_products.product_id': item.product_id,
          cart_state: 'active',
        },
        update = {
          $inc: { 'cart_products.$.product_quantity': item.product_quantity },
        },
        options = { upsert: true, new: true }
      return await cartModel.findOneAndUpdate(query, update, options)
    }
  }
  static async findProductAfterAddToCart(products) {
    console.log(
      '🚀 ~ CartService ~ findProductAfterAddToCart ~ products:',
      products,
    )
    let listProducts = []
    let message = []
    for (const item of products) {
      const select = [
        'product_name',
        'product_price',
        'product_shop',
        'product_quantity',
      ]
      const productPrice = await findProductById({
        product_id: item.product_id,
        roles: ['1111', '2222'],
        select,
      })
      if (!productPrice) {
        throw new Error('Product not found')
      } else {
        if (
          item.product_quantity > productPrice[0].product_quantity ||
          productPrice[0].product_quantity <= 0
        ) {
          message.push(productPrice[0]._id)
        } else {
          listProducts.push({
            ...item,
            product_name: productPrice[0].product_name,
            product_price: productPrice[0].product_price,
            product_shop: productPrice[0].product_shop,
          })
        }
      }
    }
    if (message.length > 0) {
      throw new Error(`${message} is out of stock`)
    }
    return listProducts
  }

  static async addToCart({ userId, products = {}, shopId }) {
    console.log('🚀 ~ CartService ~ addToCart ~ product:', products.length)
    const foundCart = await cartModel.findOne({ cart_userId: userId })
    console.log('🚀 ~ CartService ~ addToCart ~ foundCart:', foundCart)
    let listProducts = []
    if (foundCart && products.length > 0) {
      const listProduct = await this.findProductAfterAddToCart(products)
      return await this.updateCartProductQuantity(userId, listProduct)
    }
    console.log('🚀 ~ CartService ~ addToCart ~ listProducts:', listProducts)
    if (!foundCart) {
      return await this.createCart(userId, products)
    }
    if (foundCart.cart_products.length === 0) {
      const listProduct = await this.findProductAfterAddToCart(products)
      return await cartModel.findOneAndUpdate(
        { cart_userId: userId },
        { cart_products: listProduct },
        { new: true },
      )
    }
  }
}

module.exports = CartService
