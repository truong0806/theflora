const { mongoose, Schema } = require("mongoose"); // Erase if already required
const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema(
  {
    product_name: {
      type: String,
      required: true,
    },
    product_thumb: {
      type: String,
      required: true,
    },
    product_description: String,
    product_price: {
      type: Number,
      required: true,
    },
    product_quantity: {
      type: Number,
      required: true,
    },
    product_type: {
      type: String,
      required: true,
      emus: [
        "Clothing",
        "Shoes",
        "Accessories",
        "Bags",
        "Watches",
        "Jewelry",
        "Sunglasses",
        "Hats",
        "Belts",
        "Wallets",
        "Socks",
        "Ties",
        "Scarves",
        "Gloves",
        "Electronics",
        "Other",
      ],
    },
    product_shop: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Shop",
    },
    product_attributes: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

var clothingSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      require: true,
    },
    size: Array,
    metarial: String,
  },
  {
    collection: "clothing",
    timestamps: true,
  }
);

var electricSchema = new mongoose.Schema(
  {
    manufacturer: {
      type: String,
      require: true,
    },
    model: String,
    color: String,
  },
  {
    collection: "electronics",
    timestamps: true,
  }
);

//Export the model
module.exports = {
  product: mongoose.model(DOCUMENT_NAME, userSchema),
  clothing: mongoose.model("Clothing", clothingSchema),
  electric: mongoose.model("Electronics", electricSchema),
};
