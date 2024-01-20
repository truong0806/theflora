const productService = require("../services/product.service");
const { validateFields } = require("../helpers/validate");
const { Created, Accepted, OK } = require("../core/success.response");

class ProductController {
  createProduct = async (req, res, next) => {
    console.log(
      "🚀 ~ ProductController ~ createProduct= ~ eq.user.userId:",
      req.user.userId
    );

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
}
module.exports = new ProductController();
