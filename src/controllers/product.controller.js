const productService = require('../services/product.service')
const { Created, Updated, OK } = require('../core/success.response')
const { Types } = require('mongoose')
const { BadRequestError } = require('../core/error.response')

class ProductController {
  /**
   * Create product
   * @param {Object} req The request object
   * @param {Object} res The response object
   * @param {Function} next The next function
   * @returns {Object} The response object
   */
  createProduct = async (req, res, next) => {
    const productData = {
      ...req.body,
      product_shop: req.user.userId,
    }
    const { product_type } = req.body
    const createdProduct = await productService.createProduct(
      product_type,
      productData,
    )

    new Created({
      data: createdProduct,
    }).send(res)
  }

  /**
   * Get all product
   * @param {Object} req The request object
   * @param {Object} res The response object
   * @param {Function} next The next function
   * @returns {Object} The response object
   */
  getAllProduct = async (req, res, next) => {
    const products = await productService.findAllProduct(req.query)

    new OK({
      data: products,
    }).send(res)
  }

  /**
   * Get product by ids
   * @param {Object} req The request object
   * @param {Object} res The response object
   * @param {Function} next The next function
   * @returns {Object} The response object
   */
  getProductByIds = async (req, res, next) => {
    const { product_id } = req.params
    const roles = req.objKey.permissions
    const response = await productService.findProductByIdAdmin({
      product_id,
      roles,
    })
    if (!response || response.length === 0) {
      throw new BadRequestError('Product id is invalid')
    } else {
      new OK({
        data: response,
      }).send(res)
    }
  }

  /**
   * Get product by slug
   * @param {Object} req The request object
   * @param {Object} res The response object
   * @param {Function} next The next function
   * @returns {Object} The response object
   */
  getProductBySlug = async (req, res, next) => {
    const { slug } = req.params
    const roles = req.objKey.permissions
    const response = await productService.findProductBySlug({
      slug,
      roles,
    })
    if (!response || response.length === 0) {
      throw new BadRequestError('Product id is invalid')
    } else {
      new OK({
        data: response,
      }).send(res)
    }
  }

  /**
   * Get product by status
   * @param {Object} req The request object
   * @param {Object} res The response object
   * @param {Function} next The next function
   * @returns {Object} The response object
   */
  getProductByStatus = async (req, res, next) => {
    const { status } = req.params
    if (status !== 'draft' && status !== 'published') {
      throw new BadRequestError('Status is invalid')
    }
    const products = await productService.findProductShopByStatus({
      status,
      product_shop: new Types.ObjectId(req.user.userId),
    })

    new OK({
      data: products,
    }).send(res)
  }

  /**
   * Change status product by shop
   * @param {Object} req The request object
   * @param {Object} res The response object
   * @param {Function} next The next function
   * @returns {Object} The response object
   */
  changeStatusProductByShop = async (req, res, next) => {
    const { product_id } = req.body
    if (!product_id) {
      throw new BadRequestError('Product id is required')
    }
    const updatedProduct = await productService.changeStatusProductShop({
      product_shop: req.user.userId,
      product_id,
    })

    new OK({
      message: 'Publish product successfully',
      data: updatedProduct,
    }).send(res)
  }

  /**
   * Search product by key search
   * @param {Object} req The request object
   * @param {Object} res The response object
   * @param {Function} next The next function
   * @returns {Object} The response object
   */
  searchProductByKeySearchs = async (req, res, next) => {
    const { keySearch } = req.params
    const response = await productService.searchProductByKeySearch(keySearch)

    new OK({
      message: response
        ? 'Search product successfully'
        : 'Search product failed',
      data: response || {},
    }).send(res)
  }

  /**
   * Update product by id
   * @param {Object} req The request object
   * @param {Object} res The response object
   * @param {Function} next The next function
   * @returns {Object} The response object
   */
  updateProductById = async (req, res, next) => {
    const { product_type } = req.body
    const { productId } = req.params
    const updateData = {
      ...req.body,
      product_shop: req.user.userId,
    }
    const response = await productService.updateProduct(
      product_type,
      productId,
      updateData,
    )
    if (!response) {
      throw new Error('Update product failed')
    }
    new Updated({
      message: 'Update product successfully',
      data: response,
    }).send(res)
  }
}

module.exports = new ProductController()
