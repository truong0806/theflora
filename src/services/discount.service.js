const { BadRequestError } = require("../core/error.response");
const discount = require("../models/discount.model");
const { findAllProducts } = require("../models/repositories/product.repo");
const { convertToObjectId } = require("../utils");
class DiscountService {
  static async createDiscountCode({
    code,
    start_date,
    end_date,
    is_active,
    shopId,
    min_order_value,
    product_ids,
    applies_to,
    name,
    description,
    type,
    value,
    max_value,
    max_uses,
    used_count,
    max_uses_per_users,
    users_used,
  }) {
    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectId(shopId),
      })
      .lean();
    console.log("🚀 ~ DiscountService ~ foundDiscount:", foundDiscount);
    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestError("Discount code already exists");
    }
    const newDiscount = await discount.create({
      discount_name: name,
      distount_description: description,
      discount_type: type,
      discount_code: code,
      discount_value: value,
      discount_max_value: max_value,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses,
      discount_used_count: used_count,
      discount_users_used: users_used,
      discount_min_order_value: min_order_value,
      discount_shopId: convertToObjectId(shopId),
      discount_max_per_user: max_uses_per_users,
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_producut_ids: applies_to === "all" ? [] : product_ids,
    });
    if (newDiscount) {
      return newDiscount;
    } else {
      throw new BadRequestError("Discount code could not be created");
    }
  }

  static async updateDiscountCode() {}
  static async getAllDiscountCodeWithProduct({ shopId, code, limit, page }) {
    console.log(
      "🚀 ~ DiscountService ~ getAllDiscountCodeWithProduct ~ shopId, code, limit, page:",
      shopId,
      code,
      limit,
      page
    );
    console.log("🚀 ~ DiscountService ~ shopId:", shopId);
    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectId(shopId),
      })
      .lean();
    console.log(
      "🚀 ~ DiscountService ~ getAllDiscountCodeWithProduct ~ foundDiscount:",
      foundDiscount
    );
    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new BadRequestError("Discount not exists");
    }
    let products;
    const { discount_applies_to, discount_producut_ids } = foundDiscount;
    console.log(
      "🚀 ~ DiscountService ~ getAllDiscountCodeWithProduct ~ discount_applies_to:",
      discount_applies_to
    );
    if (discount_applies_to === "all") {
      products = await findAllProducts({
        filter: {
          product_shop: convertToObjectId(shopId),
          // isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }
    if (discount_applies_to === "specific") {
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_producut_ids },
          // isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }
    return products;
  }
}

module.exports = DiscountService;
