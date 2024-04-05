const { ref } = require('joi')
const { mongoose, model, Types } = require('mongoose')
const DOCUMENT_NAME = 'Comment'
const COLLECTION_NAME = 'Comments'

let commentSchema = new mongoose.Schema(
  {
    comment_productId: {
      type: Types.ObjectId,
      ref: 'Product',
    },
    comment_userId: {
      type: String,
      required: true,
    },
    comment_content: {
      type: String,
      required: true,
      default: '',
    },
    comment_left: {
      type: Number,
      required: true,
      default: 0,
    },
    comment_right: {
      type: Number,
      required: true,
      default: 0,
    },
    comment_parentId: {
      type: Types.ObjectId,
      ref: DOCUMENT_NAME,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: {
      createdAt: 'createdOn',
      updatedAt: 'modifiedOn',
    },
  },
)

//Export the model
module.exports = model(DOCUMENT_NAME, commentSchema)
