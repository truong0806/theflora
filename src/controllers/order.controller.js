const { Created, OK } = require('../core/success.response')
const validateFields = require('../helpers/validate')
const checkoutService = require('../services/checkout.service')

class OrderController {
  /**
   * Create a new order
   * @param  {object} req - Request object
   * @param  {object} res - Response object
   * @return {object} res - Response object
   */
  createOrder = async (req, res) => {
    const { userId } = req.user
    const order = await checkoutService.finalOrderByUser(req.body, userId)
    new Created({ data: order }).send(res)
  }
}
module.exports = new OrderController()
