const { product, clothing, electric } = require("../models/product.model");
const { BadRequestError, ForbiddenError } = require("../core/error.response");
const {
  findProductDraftsForShop,
} = require("../models/repositories/product.repo");

class ProductFactory {
  static productRegistry = {};

  static productRegitryType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef;
  }

  static async createProduct(type, payload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass) {
      throw new BadRequestError("Product type not found");
    }
    return await new productClass(payload).createProduct();
  }

  static async getAllProduct() {
    const products = await product.find({}).exec();
    const count = products.length;
    if (!products) {
      throw new BadRequestError("Get all product failed");
    }
    return { count, products };
  }
  static async getAllProductByShop(product_shop,{ limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: false };
    return await findProductDraftsForShop({ query, limit, skip });
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
    product_variations,
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_quantity = product_quantity;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
    this.product_variations = product_variations;
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
class Forniture extends Product {
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

ProductFactory.productRegitryType("Clothing", Clothing);
ProductFactory.productRegitryType("Electronics", Electronics);
ProductFactory.productRegitryType("Forniture", Forniture);

module.exports = ProductFactory;
