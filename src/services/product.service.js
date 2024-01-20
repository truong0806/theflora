const { product, clothing, electric } = require("../models/product.model");
const { BadRequestError, ForbiddenError } = require("../core/error.response");

class ProductFactory {
  static async createProduct(type, payload) {
    switch (type) {
      case "Clothing":
        return new Clothing(payload).createProduct();
      case "Electronics":
        return new Electronics(payload);
      default:
        throw new Error(`Type ${type} is not supported`);
    }
  }
  static async getAllProduct() {
    const products = await product.find({}).exec();
    const count = products.length;
    if (!products) {
      throw new BadRequestError("Get all product failed");
    }
    return { count, products };
  }
  static async getAllProductByType(type) {
    return await product.find({ product_type: type });
  }
  static async getProductById(id) {
    return await product.findById(id);
  }
}
class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes,
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_quantity = product_quantity;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
  }
  async createProduct(product_id) {
    return await product.create({ ...this, _id: product_id });
  }
}
class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newClothing) {
      throw new BadRequestError("Create clothing failed");
    }

    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) {
      throw new BadRequestError("Create product failed");
    }
    return newProduct;
  }
}
class Electronics extends Product {
  async createProduct() {
    const newElectric = await electric.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectric) {
      throw new BadRequestError("Create electric failed");
    }

    const newProduct = await super.createProduct(newElectric._id);
    if (!newProduct) {
      throw new BadRequestError("Create product failed");
    }
    return newProduct;
  }
}
module.exports = ProductFactory;
