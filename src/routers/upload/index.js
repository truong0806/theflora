'use strict'

const express = require('express')
const uploadController = require('../../controllers/upload.controller')
const routes = express.Router()
const { asyncHandler } = require('../../helpers/asyncHandler')
const { apiKey, permission, authentication } = require('../../auth/checkAuth')
const { uploadDisk } = require('../../configs/multer.config')
routes.use(apiKey)
routes.post(
  '/',
  authentication,
  permission(process.env.PERMISSION_ADMIN),
  uploadDisk.single('file'),
  asyncHandler(uploadController.upload),
)
routes.post(
  '/multiple',
  authentication,
  permission(process.env.PERMISSION_ADMIN),
  uploadDisk.array('files', 3),
  asyncHandler(uploadController.uploadMuti),
)

module.exports = routes
