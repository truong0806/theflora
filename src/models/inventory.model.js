const { mongoose, Schema, model, Types } = require("mongoose");
const DOCUMENT_NAME = "Inventory";
const COLLECTION_NAME = "Inventories";

// Declare the Schema of the Mongo model
var inventorySchema = new mongoose.Schema(
  {
    inven_product_id: { type: Types.ObjectId, ref: "Product" },
    inven_stock: { type: Number, required: true, default: 0 },
    invent_location: { type: String, default: "unKnown" },
    invent_reservations: { type: Array, default: [] },
    invent_shopId: { type: Types.ObjectId, ref: "Shop" },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

//Export the model
module.exports = model(DOCUMENT_NAME, inventorySchema);
