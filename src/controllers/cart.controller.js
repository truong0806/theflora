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
  getCart = async (req, res, next) => {
    const { userId } = req.user
    console.log('🚀 ~ CartController ~ getCart= ~ userId:', userId)
    new OK({
      data: await cartService.getUserCart(userId),
    }).send(res)
  }
  deleteCart = async (req, res, next) => {
    const { userId } = req.user
    new OK({
      data: await cartService.deleteUserCart(userId),
    }).send(res)
  }
}

module.exports = new CartController()
