const cartModel = require('../models/cart.model')
const { findProductById } = require('../models/repositories/product.repo')
const { ValidateProductBeforeAddToCart } = require('../utils')
const { updateCartProductQuantity, createCart, getUserCart, deleteUserCart, findCartByUserId } = require('../models/repositories/cart.repo')

class CartService {

  static async addToCart({ userId, products }) {
    const foundCart = await findCartByUserId(userId)
    let listProduct = await ValidateProductBeforeAddToCart(products)
    if (foundCart && products.length > 0) {
      return await updateCartProductQuantity({ userId, listProduct, foundCart })
    } else if (foundCart.cart_products.length === 0) {
      return await cartModel.findOneAndUpdate(
        { cart_userId: userId },
        { cart_products: listProduct },
        { new: true },
      )
    } else {
      return await createCart({ userId, listProduct })
    }
  }
  static async addToCartV2(userId, { shop_order_Id }) {
    const { productId, quantity, ol_quantity } =
      shop_order_Id[0]?.item_product[0] ?? {};
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
  static async getUserCart(userId) {
    return await getUserCart({ userId, select: ["cart_userId", "cart_count_product", "cart_products"] })
  }
  static async deleteUserCart(userId) {
    return await deleteUserCart(userId)
  }
}

module.exports = CartService
