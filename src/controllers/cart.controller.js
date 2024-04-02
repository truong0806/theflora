'use strict'

const cartService = require('../services/cart.service')
const validateFields = require('../helpers/validate')
const { Created, OK } = require('../core/success.response')

class CartController {
  /**
   * Add products to the cart.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} - A promise that resolves when the products are added to the cart.
   */
  addToCart = async (req, res, next) => {
    validateFields('cart', req.body)
    const { userId } = req.user
    const { products } = req.body
    new OK({
      data: await cartService.addToCart({ userId, products }),
      options: {
        limit: 10,
      },
    }).send(res)
  }
  /**
   * Get the user's cart.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} - A promise that resolves when the user's cart is retrieved.
   */
  getCart = async (req, res, next) => {
    const { userId } = req.user
    const cart = await cartService.getUserCart(userId)
    new OK({
      data: cart,
    }).send(res)
  }
  /**
   * Delete the user's cart.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} - A promise that resolves when the user's cart is deleted.
   */
  deleteCart = async (req, res, next) => {
    const { userId } = req.user
    const result = await cartService.deleteUserCart(userId)
    new OK({
      data: result,
    }).send(res)
  }
}

module.exports = new CartController()
