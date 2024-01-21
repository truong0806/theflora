const productService = require("../services/product.service");
const { Created, Updated, OK } = require("../core/success.response");
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
    new OK({
      data: await productService.findProductDraftsForShop({
        product_shop: new Types.ObjectId(req.user.userId),
      }),
    }).send(res);
  };
  getAllProductPublishByShop = async (req, res, next) => {
    new OK({
      data: await productService.findProductPublishForShop({
        product_shop: new Types.ObjectId(req.user.userId),
      }),
    }).send(res);
  };
  changeStatusProductByShop = async (req, res, next) => {
    const { product_id } = req.body;
    new OK({
      message: "Publish product successfully",
      data: await productService.changeStatusProductShop({
        product_shop: req.user.userId,
        product_id: product_id,
      }),
    }).send(res);
  };
}
module.exports = new ProductController();
