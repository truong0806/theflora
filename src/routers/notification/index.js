'use strict'

const express = require('express')
const NotiController = require('../../controllers/notification.controller')
const routes = express.Router()
const { asyncHandler } = require('../../helpers/asyncHandler')
const { apiKey, permission, authentication } = require('../../auth/checkAuth')

routes.use(apiKey)
routes.get(
  '',
  authentication,
  permission(process.env.PERMISSION_ADMIN),
  asyncHandler(NotiController.listNotiByUser),
)

module.exports = routes
