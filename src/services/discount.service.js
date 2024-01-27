const {BadRequestError} = require("../core/error.response");
const discount = require("../models/discount.model");
const {product} = require("../models/product.model");
const {
    findAllDiscountCode,
    checkDiscountExists,
    findDiscountByCode,
} = require("../models/repositories/discount.repo");
const {findAllProducts} = require("../models/repositories/product.repo");
const {convertToObjectId} = require("../utils");

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
        const {discount_code, discount_is_active} = foundDiscount
        if (discount_code === code) {
            throw new BadRequestError("Discount code already exists");
        }
        if (!["percent", "fix_amount"].includes(type)) {
            throw new BadRequestError(`Discount type must be percent or fix_amount`);
        }
        if (foundDiscount && discount_is_active) {
            throw new BadRequestError("Discount code already exists");
        }
        if (type === "percent") {
            if (value > 95) {
                throw new BadRequestError("Discount value must be less than 95%");
            }
        } else {
            if (value > max_value) {
                throw new BadRequestError("Discount value must be less than max value");
            }
        }
        const newDiscount = await discount.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_code: code,
            discount_value: value,
            discount_max_value: type === "fix_amount" ? value : max_value,
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
            discount_product_ids: applies_to === "all" ? [] : product_ids,
        });

        if (newDiscount) {
            return "Discount code created";
        } else {
            throw new BadRequestError("Discount code could not be created");
        }
    }

    static async deleteDiscountCode(code, shopId) {
        const foundDiscount = await findDiscountByCode(code, shopId);
        if (!foundDiscount) throw new BadRequestError("Discount not exists");
        const deletedDiscount = await discount
            .findByIdAndDelete(foundDiscount._id)
            .lean();
        if (deletedDiscount) {
            return "Discount code deleted";
        } else {
            throw new BadRequestError("Discount code could not be deleted");
        }
    }

    static async updateDiscountCode() {
    }

    static async getAllDiscountCodeWithProduct({shopId, code, limit, page}) {
        const foundDiscount = await discount
            .findOne({
                discount_code: code,
                discount_shopId: convertToObjectId(shopId),
            })
            .lean();
        const {discount_is_active, discount_product_ids, discount_applies_to} = foundDiscount
        if (!foundDiscount || !discount_is_active) {
            throw new BadRequestError("Discount not exists");
        }
        let products;
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
                    _id: {$in: discount_product_ids},
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

    static async getCodeByShop({shopId, limit, page, is_active}) {
        const foundDiscount = await findAllDiscountCode({
            shopId,
            filter: {
                discount_shopId: convertToObjectId(shopId),
            },
            limit: +limit,
            page: +page,
            unSelect: ["__v", "discount_shopId"],
            model: discount,
        });
        if (is_active === true) {
            const activeDiscount = await foundDiscount.foundDiscount.filter(
                (item) => item.discount_is_active === true
            );
            return {count: activeDiscount.length, activeDiscount};
        }
        if (is_active === false) {
            const unActiveDiscount = await foundDiscount.foundDiscount.filter(
                (item) => item.discount_is_active === false
            );
            return {count: unActiveDiscount.length, unActiveDiscount};
        }
        if (is_active === undefined || is_active === "") {
            return foundDiscount;
        }
    }

    static async applyDiscountCode({code, userId, shopId, products}) {
        const foundDiscount = await checkDiscountExists({
            filter: {
                discount_code: code,
                discount_shopId: convertToObjectId(shopId),
            },
            model: discount,
        });
        if (!foundDiscount) throw new BadRequestError("Discount not exists");
        const {
            discount_min_order_value,
            discount_start_date,
            discount_end_date,
            discount_is_active,
            discount_max_uses,
            discount_max_per_user,
            discount_users_used,
            discount_type,
            discount_max_value,
        } = foundDiscount;
        if (!discount_is_active) throw new BadRequestError("Discount is expired");
        if (!discount_max_uses)
            throw new BadRequestError("Discount codes are sold out");
        if (new Date() < new Date(discount_start_date))
            throw new BadRequestError("Discount have not started yet");
        if (new Date() > new Date(discount_end_date))
            throw new BadRequestError("Discount is expired");
        if (products.length === 0) throw new BadRequestError("Products is empty");
        let totalOrder = 0;
        if (discount_min_order_value > 0) {
            const fountProduct = await product
                .find({
                    _id: {$in: products.map((item) => item.productId)},
                })
                .lean();

            totalOrder = fountProduct.reduce((total, item) => {
                const foundItem = products.find(
                    (product) => product.productId === item._id.toString()
                );
                const {quantity} = foundItem
                return total + quantity * item.product_price;
            }, 0);
            if (totalOrder < discount_min_order_value) {
                throw new BadRequestError(
                    `Error discount code, total order must be greater than ${discount_min_order_value}`
                );
            }
            if (discount_type === "percentage" && foundDiscount.discount_value > 95) {
                throw new BadRequestError(
                    `Error discount code, discount value must be less than 95%`
                );
            }
        }
        if (discount_max_per_user > 0) {
            const userUserDiscount = await discount_users_used.find(
                (user) => user.userId === userId
            );
            if (userUserDiscount) {
                if (userUserDiscount.used >= discount_max_per_user) {
                    throw new BadRequestError(
                        `You have reached the maximum number of uses for this discount code`
                    );
                }
            }

            let amount;
            let totalPrice;
            if (discount_type === "fix_amount") {
                if (foundDiscount.discount_value > totalOrder) {
                    amount = foundDiscount.discount_value;
                    totalPrice = 0;
                } else {
                    amount = foundDiscount.discount_value;
                    totalPrice = totalOrder - amount;
                }
            } else {
                amount = (foundDiscount.discount_value / 100) * totalOrder;
                if (amount > discount_max_value) {
                    amount = discount_max_value;
                    totalPrice = totalOrder - amount;
                }
                totalPrice = totalOrder - amount;
            }
            let value;
            if (discount_type === "fix_amount") {
                value = foundDiscount.discount_value;
            } else {
                value = `${foundDiscount.discount_value}%`;
            }
            let foundUser = await discount.findOne({
                _id: foundDiscount._id,
                "discount_users_used.userId": userId,
            });
            if (foundUser) {
                // Nếu userId đã tồn tại trong discount_users_used, tăng used lên 1
                await discount.updateOne(
                    {_id: foundDiscount._id, "discount_users_used.userId": userId},
                    {
                        $inc: {
                            "discount_users_used.$.used": 1,
                            discount_used_count: 1,
                            discount_max_uses: -1,
                        },
                    }
                );
            } else {
                // Nếu userId chưa tồn tại trong discount_users_used, thêm mới
                await discount.updateOne(
                    {_id: foundDiscount._id},
                    {
                        $push: {
                            discount_users_used: {
                                userId: userId,
                                used: 1,
                            },
                        },
                        $inc: {
                            discount_used_count: 1,
                            discount_max_uses: -1,
                        },
                    }
                );
            }
            return {
                totalOrder,
                type: discount_type,
                value: value,
                discount: amount,
                discountMax: discount_max_value,
                totalPrice,
            };
        }
    }

    static async cancelDiscountCode({code, userId, shopId}) {
        const foundDiscount = await checkDiscountExists({
            filter: {
                discount_code: code,
                discount_shopId: convertToObjectId(shopId),
            },
            model: discount,
        });
        const {discount_users_used} = foundDiscount;
        if (!foundDiscount) throw new BadRequestError("Discount not exists");
        const userUserDiscount = await discount_users_used.find(
            (user) => user.userId === userId
        );
        let result;
        if (userUserDiscount) {
            if (userUserDiscount.used === 1) {
                result = await discount.findByIdAndUpdate(foundDiscount._id, {
                    $pull: {
                        discount_users_used: {
                            userId: userId,
                            used: 1,
                        },
                    },
                    $inc: {
                        discount_used_count: -1,
                        discount_max_uses: 1,
                    },
                });
            }
            if (userUserDiscount.used > 1) {
                await discount.updateOne(
                    {_id: foundDiscount._id, "discount_users_used.userId": userId},
                    {
                        $inc: {
                            "discount_users_used.$.used": -1,
                            discount_used_count: -1,
                            discount_max_uses: 1,
                        },
                    }
                );
            }
        } else {
            throw new BadRequestError("Discount code not exists");
        }
        return result;

    }
}

module.exports = DiscountService;
