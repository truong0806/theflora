const { Created, OK } = require("../core/success.response");
const validateFields = require("../helpers/validate");
const discountService = require("../services/discount.service");

class DiscountController {
  create = async (req, res, next) => {
    validateFields("discount", req.body);
    new Created({
      data: await discountService.createDiscountCode(req.body),
    }).send(res);
  };
  delete = async (req, res, next) => {
    const shopId = req.user.userId;
    const { code } = req.body;
    validateFields("discount", req.body);
    new OK({
      data: await discountService.deleteDiscountCode(code, shopId),
    }).send(res);
  };
  update = async (req, res, next) => {
    validateFields("discount", req.body);
    new Created({
      data: await discountService.createDiscountCode(req.body),
    }).send(res);
  };
  getAllDiscountCodeProduct = async (req, res, next) => {
    new Created({
      data: await discountService.getAllDiscountCodeWithProduct(req.body),
    }).send(res);
  };
  getDiscountByCode = async (req, res, next) => {
    validateFields("discount", req.body);
    new OK({
      data: await discountService.getCodeByShop(req.body),
    }).send(res);
  };
  applyDiscount = async (req, res, next) => {
    validateFields("discount", req.body);
    new OK({
      data: await discountService.getDiscountAmount(req.body),
    }).send(res);
  };
}
module.exports = new DiscountController();
