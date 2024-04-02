const { Created, OK } = require('../core/success.response')
const validateFields = require('../helpers/validate')
const checkoutService = require('../services/checkout.service')

class CheckoutController {
  /**
   * POST /api/v1/checkout/review - Checkout order
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @param {Function} next - middleware function
   * @returns {object} - Created response with data
   */
  checkoutOrder = async (req, res, next) => {
    try {
      const checkoutData = await checkoutService.checkoutReview(req.body)
      new Created({ data: checkoutData }).send(res)
    } catch (error) {
      next(error)
    }
  }

}
module.exports = new CheckoutController()
