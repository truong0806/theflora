const { Created, OK } = require("../core/success.response");
const validateFields = require("../helpers/validate");
const discountService = require("../services/discount.service");

class DiscountController {
  /**
   * Create a new discount code
   * @param  {Object} req
   * @param  {Object} res
   * @param  {Function} next
   */
  create = async (req, res, next) => {
    validateFields("discount", req.body);
    const data = await discountService.createDiscountCode(req.body);
    new Created({ data }).send(res);
  };
  /**
   * Delete an existing discount code
   * @param  {Object} req
   * @param  {Object} res
   * @param  {Function} next
   */
  delete = async (req, res, next) => {
    const shopId = req.user.userId;
    const { code } = req.body;
    validateFields("discount", req.body);
    const data = await discountService.deleteDiscountCode(code, shopId);
    new OK({ data }).send(res);
  };
  /**
   * Update an existing discount code
   * @param  {Object} req
   * @param  {Object} res
   * @param  {Function} next
   */
  update = async (req, res, next) => {
    validateFields("discount", req.body);
    const data = await discountService.createDiscountCode(req.body);
    new Created({ data }).send(res);
  };
  /**
   * Get all discount code with product
   * @param  {Object} req
   * @param  {Object} res
   * @param  {Function} next
   */
  getAllDiscountCodeProduct = async (req, res, next) => {
    const data = await discountService.getAllDiscountCodeWithProduct(req.body);
    new Created({ data }).send(res);
  };
  /**
   * Get discount code by shop
   * @param  {Object} req
   * @param  {Object} res
   * @param  {Function} next
   */
  getDiscountByCode = async (req, res, next) => {
    validateFields("discount", req.body);
    const data = await discountService.getCodeByShop(req.body);
    new OK({ data }).send(res);
  };
  /**
   * Get discount amount by code
   * @param  {Object} req
   * @param  {Object} res
   * @param  {Function} next
   */
  getDiscount = async (req, res, next) => {
    validateFields("discount", req.body);
    const data = await discountService.getDiscountAmount(req.body);
    new OK({ data }).send(res);
  };
  /**
   * Apply discount code to checkout
   * @param  {Object} req
   * @param  {Object} res
   * @param  {Function} next
   */
  apllyDiscountCode = async (req, res, next) => {
    validateFields("discount", req.body);
    const data = await discountService.getDiscountAmount(req.body, true);
    new OK({ data }).send(res);
  };
  /**
   * Cancel discount code
   * @param  {Object} req
   * @param  {Object} res
   * @param  {Function} next
   */
  cancelDiscount = async (req, res, next) => {
    validateFields("discount", req.body);
    const data = await discountService.cancelDiscountCode(req.body);
    new OK({ data }).send(res);
  };
}
module.exports = new DiscountController();
