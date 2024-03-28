'use strict'

const express = require('express')
const checkoutController = require('../../controllers/checkout.controller')
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
  '/review',
  permission(process.env.PERMISSION_ADMIN),
  asyncHandler(checkoutController.checkoutOrder),
)

module.exports = routes
