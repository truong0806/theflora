const { mongoose, model, Types } = require('mongoose')
const DOCUMENT_NAME = 'Notification'
const COLLECTION_NAME = 'Notifications'

// ORDER-001: Order success
// ORDER-002: Order failed
// PROMOTION-001: Promotion success created
// PRODUCT-001: Product success created

let notificationSchema = new mongoose.Schema(
  {
    noti_type: {
      type: String,
      enum: ['ORDER-001', 'ORDER-002', 'PROMOTION-001', 'PRODUCT-001'],
      required: true,
    },
    noti_senderId: {
      type: Types.ObjectId,
      required: true,
    },
    noti_receivedId: {
      type: Number,
      required: true,
      default: '',
    },
    noti_content: {
      type: String,
      required: true,
      default: 0,
    },
    noti_options: {
      type: Object,
      default: {},
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
module.exports = model(DOCUMENT_NAME, notificationSchema)
