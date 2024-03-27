const { product, clothing, electric } = require('../models/product.model')
const { BadRequestError } = require('../core/error.response')
const {
  findProductShopByStatus,
  changeStatusProductShop,
  findAllProducts,
  findProductById,
  findProductBySlug,
  searchProductByKeySearch,
  updateProductById,
  findProductByIdAdmin,
} = require('../models/repositories/product.repo')
const { createInventory } = require('../models/repositories/inventory.repo')
const {
  removeUndefined,
  updateNestedObjectParse,
} = require('../utils/mongoose')

class ProductFactory {
  static productRegistry = {}

  static productRegitryType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef
  }

  static async createProduct(type, payload) {
    const productClass = ProductFactory.productRegistry[type]
    if (!productClass) {
      throw new BadRequestError('Product type not found')
    }
    return await new productClass(payload).createProduct()
  }
  static async updateProduct(type, productId, payload) {
    const productClass = ProductFactory.productRegistry[type]
    if (!productClass) {
      throw new BadRequestError('Product type not found')
    }
    return await new productClass(payload).updateProduct(productId)
  }

  static async findAllProduct({
    limit = 50,
    sort = 'ctime',
    page = 1,
    filter = { isPublished: true },
  }) {
    return await findAllProducts({
      limit,
      sort,
      page,
      filter,
      select: ['product_name', 'product_price', 'product_thumb'],
    })
  }
  static async findProductShopByStatus({ status, product_shop }) {
    const limit = 50
    const skip = 0
    const query = {
      product_shop,
      isDraft: status === 'draft',
      isPublished: status === 'published',
    }
    return await findProductShopByStatus({ query, limit, skip })
  }
  static async findProductPublishForShop({ product_shop }) {
    const limit = 50
    const skip = 0
    const query = { product_shop, isDraft: false, isPublished: true }
    return await findProductPublishForShop({ query, limit, skip })
  }

  static async findProductById(product_id) {
    return await findProductById({
      product_id,
      select: ['product_name', 'product_price', 'product_quantity'],
    })
  }
  static async findProductByIdAdmin({ product_id, roles }) {
    return await findProductByIdAdmin({
      product_id,
      roles,
    })
  }
  static async findProductBySlug({ slug, roles }) {
    return await findProductBySlug({
      slug,
      roles,
      unselect: ['product_shop'],
    })
  }
  static async searchProductByKeySearch({ keySearch }) {
    return await searchProductByKeySearch({ keySearch })
  }
  static async changeStatusProductShop({ product_shop, product_id }) {
    const updated = await changeStatusProductShop({ product_shop, product_id })
    if (!updated) {
      throw new BadRequestError('Publish product failed')
    } else {
      return updated
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
    this.product_name = product_name
    this.product_thumb = product_thumb
    this.product_description = product_description
    this.product_price = product_price
    this.product_quantity = product_quantity
    this.product_type = product_type
    this.product_shop = product_shop
    this.product_attributes = product_attributes
    this.product_variations = product_variations
  }
  async createProduct(product_id) {
    const newProduct = await product.create({ ...this, _id: product_id })
    if (newProduct) {
      await createInventory({
        productId: newProduct._id,
        shopId: this.product_shop,
        stock: this.product_quantity,
      })
    }
    return newProduct
  }
  async updateProduct(productId, bodyUpdate) {
    return await updateProductById({ productId, bodyUpdate, model: product })
  }
}
class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    })
    if (!newClothing) {
      throw new BadRequestError('Create clothing failed')
    }
    const newProduct = await super.createProduct(newClothing._id)
    if (!newProduct) {
      throw new BadRequestError('Create product failed')
    }
    return newProduct
  }
  async updateProduct(productId) {
    const objectParams = removeUndefined(this)
    if (objectParams.product_attributes) {
      await updateProductById({
        productId,
        bodyUpdate: updateNestedObjectParse(objectParams.product_attributes),
        objectParams,
        model: electric,
      })
    }
    const updated = await super.updateProduct(
      productId,
      updateNestedObjectParse(objectParams),
    )
    return updated
  }
}
class Electronics extends Product {
  async createProduct() {
    const newElectric = await electric.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    })
    if (!newElectric) {
      throw new BadRequestError('Create electric failed')
    }
    const newProduct = await super.createProduct(newElectric._id)
    if (!newProduct) {
      throw new BadRequestError('Create product failed')
    }
    return newProduct
  }
  async updateProduct(productId) {
    const objectParams = removeUndefined(this)
    if (objectParams.product_attributes) {
      await updateProductById({
        productId,
        bodyUpdate: updateNestedObjectParse(objectParams.product_attributes),
        objectParams,
        model: electric,
      })
    }
    const updated = await super.updateProduct(
      productId,
      updateNestedObjectParse(objectParams),
    )
    return updated
  }
}

ProductFactory.productRegitryType('Clothing', Clothing)
ProductFactory.productRegitryType('Electronics', Electronics)

module.exports = ProductFactory
