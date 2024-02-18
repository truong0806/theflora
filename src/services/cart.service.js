const { mongoose } = require('mongoose')
const cartModel = require('../models/cart.model')
const { findProductById } = require('../models/repositories/product.repo')
const { convertToObjectId } = require('../utils')
const { findById } = require('./apikey.service')
const { findProductByIdAdmin } = require('./product.service')

class CartService {
  static async createCart({ userId, products }) {
    console.log('🚀 ~ CartService ~ createCart ~ userId:', userId)
    console.log('🚀 ~ CartService ~ createCart ~ product:', products)
    const query = {
        cart_userId: userId,
        cart_state: 'active',
      },
      updateOrInsert = {
        $addToSet: {
          cart_products: products,
        },
      },
      options = { upsert: true, new: true }
    return await cartModel.findOneAndUpdate(query, updateOrInsert, options)
  }
  static async createCartV2({ userId, shop_order_Id }) {
    for (let item of shop_order_Id) {
      const { item_product } = item
      for (let product of item_product) {
        const productInDb = await findProductById({
          product_id: product.productId,
        })
        if (!productInDb) {
          throw new Error(`Product ${product.productId} not found`)
        }
        console.log(
          '🚀 ~ CartService ~ createCartV2 ~ productInDb:',
          productInDb,
        )
        if (productInDb.product_quantity < product.quantity) {
          throw new Error(
            `Product ${product.productId} does not have enough quantity in stock.`,
          )
        }
      }
    }
    const query = {
      cart_userId: userId,
      cart_state: 'active',
    }

    const updateOrInsert = {
      $addToSet: { cart_products: { $each: shop_order_Id } },
    }

    const options = { upsert: true, new: true }
    return await cartModel.findOneAndUpdate(query, updateOrInsert, options)
  }

  static async updateCartProductQuantity({ userId, listProduct }) {
    for (let i = 0; i < listProduct.length; i++) {
      const { productId, quantity } = listProduct[i]
      console.log("🚀 ~ CartService ~ updateCartProductQuantity ~ productId, quantity:", productId, quantity)
      const query = {
        cart_userId: userId,
        cart_state: 'active',
        'cart_products.productId': productId,
      }
      const updateSet = {
        $inc: { 'cart_products.$.quantity': quantity },
      }
      const options = { upsert: true, new: true }
      await cartModel.findOneAndUpdate(query, updateSet, options)
    }
    return await cartModel.findOne({
      cart_userId: userId,
      cart_state: 'active',
    })
  }

  static async updateCartProductQuantityV2({ userId, shop_order_Id }) {
    for (let item of shop_order_Id) {
      for (let product of item.item_product) {
        const productId = product.productId
        console.log(
          '🚀 ~ CartService ~ updateCartProductQuantityV2 ~ productId:',
          productId,
        )
        const quantity = product.quantity
        const query = {
            cart_userId: userId,
            cart_state: 'active',
            'cart_products.$[].item_product.$[elem].productId': productId,
          },
          updateSet = {
            $inc: {
              'cart_products.$[].item_product.$[elem].quantity': quantity,
            },
          },
          options = {
            arrayFilters: [{ 'elem.productId': productId }],
            new: true,
          }
        await cartModel.findOneAndUpdate(query, updateSet, options)
      }
    }
  }

  static async findProductAfterAddToCart(products) {
    let listProducts = []
    let message = []
    for (const item of products) {
      const select = [
        'product_name',
        'product_price',
        'product_shop',
        'product_quantity',
      ]
      const productPrice = await findProductByIdAdmin({
        product_id: item.productId,
        roles: ['1111', '2222'],
        select,
      })
      if (!productPrice) {
        throw new Error('Product not found')
      } else {
        if (
          item.quantity > productPrice[0].product_quantity ||
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

  static async addToCart({ userId, products }) {
    console.log('🚀 ~ CartService ~ addToCart ~ products:', products)
    const foundCart = await cartModel.findOne({ cart_userId: userId })
    if (foundCart && products.length > 0) {
      const listProduct = await this.findProductAfterAddToCart(products)
      console.log('🚀 ~ CartService ~ addToCart ~ listProduct:', listProduct)
      return await this.updateCartProductQuantity({ userId, listProduct })
    }
    if (!foundCart) {
      return await this.createCart({ userId, products })
    }
    if (foundCart.cart_products.length === 0) {
      console.log('dcsb')
      const listProduct = await this.findProductAfterAddToCart(products)
      return await cartModel.findOneAndUpdate(
        { cart_userId: userId },
        { cart_products: listProduct },
        { new: true },
      )
    }
  }
  static async addToCartV2(userId, { shop_order_Id }) {
    const { productId, quantity, ol_quantity } =
      shop_order_Id[0]?.item_product[0]
    const foundCart = await cartModel.findOne({ cart_userId: userId })
    if (!foundCart) {
      return await this.createCart({
        userId: userId,
        shop_order_Id: shop_order_Id,
      })
    }

    const foundProduct = await findProductById({ product_id: productId })
    if (!foundProduct) {
      throw new Error('Product not found')
    }
    const old_quantity = foundProduct.product_quantity
    if (foundProduct.product_shop.toString() !== shop_order_Id[0]?.shopId) {
      throw new Error('Product not found in this shop')
    }
    if (foundProduct.product_quantity < quantity) {
      throw new Error('Product out of stock')
    }
    if (quantity === 0) {
      ///delete
    }
    for (let item of shop_order_Id) {
      const { item_product } = item
      for (let product of item_product) {
        const productId = product.productId
        const productInDb = await findProductById({
          product_id: productId,
        })
        if (!productInDb) {
          throw new Error(`Product ${product.productId} not found`)
        }
        if (productInDb.product_quantity < product.quantity) {
          throw new Error(
            `Product ${product.productId} does not have enough quantity in stock.`,
          )
        }
      }
    }
    return await CartService.updateCartProductQuantity({
      userId: userId,
      product: { productId, quantity: quantity - ol_quantity },
    })
  }
  static async deleteUserCart({ userId, productId }) {
    const query = { cart_userId: userId, cart_state: 'active' }
    updateSet = {
      $pull: { cart_products: { productId: productId } },
    }
    return await cartModel.findOneAndUpdate(query, updateSet, { new: true })
  }
  static async getUserCart(userId) {
    return await cartModel.findOne({
      cart_userId: userId,
      cart_state: 'active',
    })
  }
}

module.exports = CartService
