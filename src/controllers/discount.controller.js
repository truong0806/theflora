const { Created } = require("../core/success.response");
const validateFields = require("../helpers/validate");
const discountService = require("../services/discount.service");

class DiscountController {
  create = async (req, res, next) => {
    validateFields("discount", req.body);
    new Created({
      data: await discountService.createDiscountCode(req.body),
    }).send(res);
  };
  update = async (req, res, next) => {
    validateFields("discount", req.body);
    new Created({
      data: await discountService.createDiscountCode(req.body),
    }).send(res);
  };
  getAllDiscountCodeProduct = async (req, res, next) => {
    validateFields("discount", req.body);
    new Created({
      data: await discountService.getAllDiscountCodeWithProduct(req.body),
    }).send(res);
  };
}
module.exports = new DiscountController();
