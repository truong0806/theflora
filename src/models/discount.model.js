const {mongoose, Schema, model, Types} = require("mongoose");
const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "Discounts";

// Declare the Schema of the Mongo model
const discountSchema = new mongoose.Schema(
    {
        discount_name: {type: String, required: true},
        discount_description: {type: String, required: true},
        discount_type: {type: String, required: true, default: "fix_amount"},
        discount_value: {type: Number, required: true},
        discount_code: {type: String, required: true},
        discount_start_date: {type: Date, required: true},
        discount_end_date: {type: Date, required: true},
        discount_max_uses: {type: Number, required: true},
        discount_max_value: {type: Number, required: true},
        discount_used_count: {type: Number, required: true},
        discount_users_used: {type: Array, default: []},
        discount_max_per_user: {type: Number, required: true},
        discount_min_order_value: {type: Number, required: true},
        discount_shopId: {type: Schema.Types.ObjectId, ref: "Shop", required: true},
        discount_is_active: {type: Boolean, default: true},
        discount_applies_to: {
            type: String,
            required: true,
            enum: ["all", "specific"],
        },
        discount_product_ids: {type: Array, default: []},
    },
    {
        collection: COLLECTION_NAME,
        timestamps: true,
    }
);

//Export the model
module.exports = model(DOCUMENT_NAME, discountSchema);
