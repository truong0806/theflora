const { product, clothing, electric } = require("../models/product.model");
const { BadRequestError } = require("../core/error.response");
const {
  findProductShopByStatus,
  changeStatusProductShop,
  findAllProducts,
  findProductById,
  findProductBySlug,
  searchProductByKeySearch,
  updateProductById,
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

  static async findAllProduct({
    limit = 50,
    sort = "ctime",
    page = 1,
    filter = { isPublished: true },
  }) {
    return await findAllProducts({
      limit,
      sort,
      page,
      filter,
      select: ["product_name", "product_price", "product_thumb"],
    });
  }
  static async findProductShopByStatus({ status, product_shop }) {
    const limit = 50;
    const skip = 0;
    const query = {
      product_shop,
      isDraft: status === "draft",
      isPublished: status === "published",
    };
    return await findProductShopByStatus({ query, limit, skip });
  }
  static async findProductPublishForShop({ product_shop }) {
    const limit = 50;
    const skip = 0;
    const query = { product_shop, isDraft: false, isPublished: true };
    return await findProductPublishForShop({ query, limit, skip });
  }

  static async findProductById({ product_id, roles }) {
    console.log("🚀 ~ ProductFactory ~ findProductById ~ product_id:", product_id)
    return await findProductById({
      product_id,
      roles,
      unselect: ["product_shop"],
    });
  }
  static async findProductBySlug({ slug, roles }) {
    console.log("🚀 ~ ProductFactory ~ findProductById ~ product_id:", slug)
    return await findProductBySlug({
      slug,
      roles,
      unselect: ["product_shop"],
    });
  }
  static async searchProductByKeySearch({ keySearch }) {
    console.log(
      "🚀 ~ ProductFactory ~ searchProductByKeySearch ~ keySearch:",
      keySearch
    );
    return await searchProductByKeySearch({ keySearch });
  }
  static async changeStatusProductShop({ product_shop, product_id }) {
    const updated = await changeStatusProductShop({ product_shop, product_id });
    if (!updated) {
      throw new BadRequestError("Publish product failed");
    } else {
      return updated;
    }
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
  async updateProduct({product_id,bodyUpdate}) {
    return await updateProductById(product_id, bodyUpdate{ isNew=true });
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
