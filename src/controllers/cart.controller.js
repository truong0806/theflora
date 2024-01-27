'use strict'

const cartService = require('../services/cart.service')
const validateFields = require('../helpers/validate')
const { Created, OK } = require('../core/success.response')

class CartController {
  addToCart = async (req, res, next) => {
    const { userId } = req.user
    const { products } = req.body
    validateFields('cart', req.body)
    new OK({
      data: await cartService.addToCart({
        userId: userId,
        products: products,
      }),
      options: {
        limit: 10,
      },
    }).send(res)
  }
}

module.exports = new CartController()
