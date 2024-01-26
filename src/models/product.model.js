const { mongoose, Schema } = require("mongoose"); // Erase if already required
const slug = require("slug");
const uniqueSlug = require("unique-slug");
const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema(
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
    product_slug: {
      type: String,
    },
    product_ratingsAverage: {
      type: Number,
      default: 4.3,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
    },
    product_variations: {
      type: Array,
      default: [],
    },
    isDraft: {
      type: Boolean,
      default: true,
      index: true,
      selection: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
      selection: false,
      index: true,
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);
productSchema.index({ product_name: "text" }, { product_description: "text" });
//middleware
productSchema.pre("save", async function (next) {
  this.product_slug = slug(this.product_name, { lower: true });
  const slugMatch = await this.constructor.find({
    product_slug: this.product_slug,
  });
  if (this.isNew && slugMatch.length > 0) {
    const uniqueId = uniqueSlug();
    this.product_slug = `${this.product_slug}-${uniqueId}`;
  }

  next();
});

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
    model: Array,
    color: Array,
  },
  {
    collection: "Electronics",
    timestamps: true,
  }
);

//Export the model
module.exports = {
  product: mongoose.model(DOCUMENT_NAME, productSchema),
  clothing: mongoose.model("Clothing", clothingSchema),
  electric: mongoose.model("Electronics", electricSchema),
};
