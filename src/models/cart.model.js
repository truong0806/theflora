const { mongoose, model } = require('mongoose')
const DOCUMENT_NAME = 'Cart'
const COLLECTION_NAME = 'Carts'

var cartSchema = new mongoose.Schema(
  {
    cart_state: {
      type: String,
      required: true,
      enum: ['active', 'completed', 'failed', 'panding'],
      default: 'active',
    },
    cart_products: {
      type: Array,
      required: true,
      default: [
      ],
    },
    cart_count_product: { type: Number, required: true, default: 0 },
    cart_userId: { type: String, required: true },
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
module.exports = model(DOCUMENT_NAME, cartSchema)
