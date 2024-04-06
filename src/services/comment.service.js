const { BadRequestError } = require('../core/error.response')
const Comment = require('../models/comment.model')
const { findProductById } = require('../models/repositories/product.repo')
const { ConvertToObjectId } = require('../utils/mongoose/mongoose')
/*
    key feature: Comment Service
    + add comment [User, Shop],
    + get list comment [User, Shop],
    + delete comment [User, Shop, Admin],
    + update comment [User, Shop],
*/

class CommentService {
  static async createComment({ productId, userId, content, parentId = null }) {
    const foundProduct = await findProductById({
      product_id: productId,
      select: ['_id'],
      isPublished: true,
    })
    if (!foundProduct) {
      throw new ErrorResponse('Product not found')
    }
    const comment = new Comment({
      comment_productId: productId,
      comment_userId: userId,
      comment_content: content,
      comment_parentId: parentId,
    })
    let rightValue
    if (parentId) {
      const parentComment = await Comment.findById(parentId)
      if (!parentComment) {
        throw new BadRequestError('Parent comment not found')
      }
      rightValue = parentComment.comment_right
      const updateRight = await Comment.updateMany(
        {
          comment_productId: ConvertToObjectId(productId),
          comment_right: { $gte: rightValue },
        },
        {
          $inc: { comment_right: 2 },
        },
      )
      console.log(
        '🚀 ~ CommentService ~ createComment ~ updateRight:',
        updateRight,
      )
      const updateLeft = await Comment.updateMany(
        {
          comment_productId: ConvertToObjectId(productId),
          comment_left: { $gte: rightValue },
        },
        {
          $inc: { comment_left: 2 },
        },
      )
      console.log(
        '🚀 ~ CommentService ~ createComment ~ updateLeft:',
        updateLeft,
      )
    } else {
      const maxRightValue = await Comment.findOne(
        {
          comment_productId: ConvertToObjectId(productId),
        },
        'comment_right',
        { sort: { comment_right: -1 } },
      )
      if (!maxRightValue) {
        rightValue = 1
      } else {
        rightValue = maxRightValue.comment_right + 1
      }
    }
    comment.comment_left = rightValue
    comment.comment_right = rightValue + 1
    await comment.save()
    return comment
  }
  static async getComment({
    productId,
    parentId = null,
    page = 1,
    limit = 10,
  }) {
    const foundProduct = await findProductById({
      product_id: productId,
      select: ['_id'],
      isPublished: true,
    })
    if (!foundProduct) {
      throw new ErrorResponse('Product not have comment')
    }
    if (parentId) {
      const foundParent = await Comment.findById(parentId)
      if (!foundParent) {
        throw new BadRequestError('Parent comment not found')
      }
      const foundComment = await Comment.find({
        comment_productId: ConvertToObjectId(productId),
        comment_left: { $gte: foundParent.comment_left },
        comment_right: { $lte: foundParent.comment_right },
      })
        .select({
          comment_content: 1,
          comment_userId: 1,
          comment_left: 1,
          comment_right: 1,
        })
        .sort({ comment_left: 1 })
        .lean()
      return foundComment
    }
    const foundComment = await Comment.find({
      comment_productId: ConvertToObjectId(productId),
    })
      .select({
        comment_content: 1,
        comment_userId: 1,
        comment_left: 1,
        comment_right: 1,
      })
      .sort({ comment_left: 1 })
      .lean()
    return foundComment
  }
  static async deleteComment({ commentId, productId }) {
    const product = await findProductById({
      product_id: productId,
      select: ['_id'],
      isPublished: true,
    })
    if (!product) {
      throw new BadRequestError('Product not found')
    }
    const comment = await Comment.findById(commentId)
    if (!comment) {
      throw new BadRequestError('Comment not found')
    }
    const width = comment.comment_right - comment.comment_left + 1
    await Comment.deleteMany({
      comment_productId: ConvertToObjectId(productId),
      comment_left: { $gte: comment.comment_left, $lte: comment.comment_right },
    })
    await Comment.updateMany(
      {
        comment_productId: ConvertToObjectId(productId),
        comment_right: { $gt: comment.comment_right },
      },
      { $inc: { comment_right: -width } },
    )
    await Comment.updateMany(
      {
        comment_productId: ConvertToObjectId(productId),
        comment_left: { $gt: comment.comment_left },
      },
      { $inc: { comment_left: -width } },
    )
  }
  static async updateComment({ commentId, content, productId }) {
    const product = await findProductById({
      product_id: productId,
      select: ['_id'],
      isPublished: true,
    })
    if (!product) {
      throw new BadRequestError('Product not found')
    }
    const comment = await Comment.findById(commentId)
    if (!comment) {
      throw new BadRequestError('Comment not found')
    }
    comment.comment_content = content
    await comment.save()
    return comment
  }
}
module.exports = CommentService
