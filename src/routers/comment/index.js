'use strict'

const express = require('express')
const CommentController = require('../../controllers/comment.controller')
const routes = express.Router()
const { asyncHandler } = require('../../helpers/asyncHandler')
const { apiKey, permission, authentication } = require('../../auth/checkAuth')

routes.use(apiKey)
routes.post(
  '',
  permission(process.env.PERMISSION_USER),
  asyncHandler(CommentController.create),
)
routes.get(
  '',
  permission(process.env.PERMISSION_USER),
  asyncHandler(CommentController.getComment),
)

module.exports = routes
