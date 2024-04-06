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
routes.delete(
  '',
  permission(process.env.PERMISSION_USER),
  asyncHandler(CommentController.delete),
)
routes.patch(
  '',
  permission(process.env.PERMISSION_USER),
  asyncHandler(CommentController.update),
)

module.exports = routes
