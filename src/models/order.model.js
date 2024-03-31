const { mongoose, Schema, model, Types } = require('mongoose')
const DOCUMENT_NAME = 'Order'
const COLLECTION_NAME = 'Orders'

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema(
  {
    order_userrId: { type: String, required: true },
    order_checkout: { type: Object, required: true },
    // order_checkout : {
    //     totalPrice,
    //     totalApplyDiscount,
    //     feeShip
    // }
    order_shipping: { type: Object, required: true },
    // order_shipping: {
    //   street,
    //   city,
    //   state,
    //   country,
    // },
    order_payment: { type: Object, required: true },
    order_products: { type: Array, required: true },
    order_trackingnumber: {
      type: String,
      required: true,
      default: '#0000108061999',
    },
    order_status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'cancelled', 'delivered'],
      default: 'pending',
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  },
)

//Export the model
module.exports = model(DOCUMENT_NAME, orderSchema)
