'use strict'

const CommentService = require('../services/comment.service')
const validateFields = require('../helpers/validate')
const { Created, OK } = require('../core/success.response')

class CommentController {
  create = async (req, res) => {
    const { data } = await CommentService.createComment(req.body)
    new Created({ data }).send(res)
  }
  getComment = async (req, res) => {
    const data = await CommentService.getComment(req.body)
    new OK({ data: data }).send(res)
  }
  delete = async (req, res) => {
    const data = await CommentService.deleteComment(req.body)
    new OK({ data: data }).send(res)
  }
  update = async (req, res) => {
    const data = await CommentService.updateComment(req.body)
    new OK({ data: data }).send(res)
  }
}

module.exports = new CommentController()
