const productService = require("../services/product.service");
const { validateFields } = require("../helpers/validate");
const { Created, Accepted, OK } = require("../core/success.response");
const { Types } = require("mongoose");

class ProductController {
  createProduct = async (req, res, next) => {
    new Created({
      data: await productService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };
  getAllProduct = async (req, res, next) => {
    new OK({
      data: await productService.getAllProduct(),
    }).send(res);
  };
  getProductDraftByShop = async (req, res, next) => {
    console.log(
      "🚀 ~ ProductController ~ getProductDraftByShop= ~ req.user.userId:",
      req.user.userId
    );
    new OK({
      data: await productService.getAllProductByShop({
        product_shop:req.user.userId,
      }),
    }).send(res);
  };
}
module.exports = new ProductController();
