const { mongoose, Schema, model } = require("mongoose");
const DOCUMENT_NAME = "Key";
const COLLECTION_NAME = "Keys";

// Declare the Schema of the Mongo model
var keyTokenSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "shop",
    },
    publicKey: {
      type: String,
      required: true,
    },
    refreshTokenUsed: {
      type: Array,
      default: [],
    },
    refreshToken: {
      type: String,
      required: true,
    },
    logged: {
      type: Array,
      default: [],
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

//Export the model
module.exports = model(DOCUMENT_NAME, keyTokenSchema);
