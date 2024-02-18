'use strict'

const express = require('express')
const cartController = require('../../controllers/cart.controller')
const routes = express.Router()
const { asyncHandler } = require('../../helpers/asyncHandler')
const {
  apiKey,
  permission,
  authentication,
  authenticationV2,
} = require('../../auth/checkAuth')

routes.use(apiKey)
routes.post(
  '',
  permission(process.env.PERMISSION_USER),
  authentication,
  asyncHandler(cartController.addToCart),
)
routes.get(
  '/getcart',
  permission(process.env.PERMISSION_USER),
  authentication,
  asyncHandler(cartController.getCart),
)

module.exports = routes
