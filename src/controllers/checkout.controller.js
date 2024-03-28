const { Created, OK } = require('../core/success.response')
const validateFields = require('../helpers/validate')
const checkoutService = require('../services/checkout.service')

class CheckoutController {
  checkoutOrder = async (req, res, next) => {
    new Created({
      data: await checkoutService.checkoutReview(req.body),
    }).send(res)
  }
}
module.exports = new CheckoutController()
