'use strict'

const express = require('express')
const orderController = require('../../controllers/order.controller')
const routes = express.Router()
const { asyncHandler } = require('../../helpers/asyncHandler')
const { apiKey, permission, authentication } = require('../../auth/checkAuth')

routes.use(apiKey)
routes.post(
  '/',
  authentication,
  permission(process.env.PERMISSION_ADMIN),
  asyncHandler(orderController.createOrder),
)

module.exports = routes
