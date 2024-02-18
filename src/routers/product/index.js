'use strict'

const express = require('express')
const productController = require('../../controllers/product.controller')
const routes = express.Router()
const { apiKey, permission, authentication } = require('../../auth/checkAuth')
const { asyncHandler } = require('../../helpers/asyncHandler')

routes.get('', asyncHandler(productController.getAllProduct))
routes.use(apiKey)
routes.get('/id/:product_id', asyncHandler(productController.getProductByIds))
routes.get('/:slug', asyncHandler(productController.getProductBySlug))
routes.get(
  '/search/:keySearch',
  asyncHandler(productController.searchProductByKeySearchs),
)

//User routes
routes.use(permission(process.env.PERMISSION_USER))
routes.use(authentication)

//Admin routes
// routes.use(permission(process.env.PERMISSION_ADMIN));
routes.post('/create', asyncHandler(productController.createProduct))
routes.put(
  '/changestatus',
  asyncHandler(productController.changeStatusProductByShop),
)
routes.get('/:status/all', asyncHandler(productController.getProductByStatus))
routes.patch(
  '/update/:productId',
  asyncHandler(productController.updateProductById),
)

module.exports = routes
