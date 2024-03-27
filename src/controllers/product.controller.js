const productService = require('../services/product.service')
const { Created, Updated, OK } = require('../core/success.response')
const { Types } = require('mongoose')
const { BadRequestError } = require('../core/error.response')

class ProductController {
  createProduct = async (req, res, next) => {
    new Created({
      data: await productService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res)
  }
  getAllProduct = async (req, res, next) => {
    new OK({
      data: await productService.findAllProduct(req.query),
    }).send(res)
  }
  getProductByIds = async (req, res, next) => {
    const roles = req.objKey.permissions
    const product_id = req.params.product_id
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
  getProductBySlug = async (req, res, next) => {
    const roles = req.objKey.permissions
    const slug = req.params.slug
    console.log('🚀 ~ ProductController ~ getProductBySlug= ~ slug:', slug)
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
  getProductByStatus = async (req, res, next) => {
    const { status } = req.params
    if (status !== 'draft' && status !== 'published') {
      throw new BadRequestError('Status is invalid')
    }
    new OK({
      data: await productService.findProductShopByStatus({
        status: status,
        product_shop: new Types.ObjectId(req.user.userId),
      }),
    }).send(res)
  }
  changeStatusProductByShop = async (req, res, next) => {
    const { product_id } = req.body
    if (!product_id) {
      throw new BadRequestError('Product id is required')
    }
    new OK({
      message: 'Publish product successfully',
      data: await productService.changeStatusProductShop({
        product_shop: req.user.userId,
        product_id: product_id,
      }),
    }).send(res)
  }
  searchProductByKeySearchs = async (req, res, next) => {
    const response = await productService.searchProductByKeySearch(keySearch)
    new OK({
      message: response
        ? 'Search product successfully'
        : 'Search product failed',
      data: response || {},
    }).send(res)
  }
  updateProductById = async (req, res, next) => {
    const response = await productService.updateProduct(
      req.body.product_type,
      req.params.productId,
      {
        ...req.body,
        product_shop: req.user.userId,
      },
    )
    if (!response) {
      throw new Error('Update product failed')
    }

    new OK({
      message: 'Update product successfully',
      data: response,
    }).send(res)
  }
}
module.exports = new ProductController()
