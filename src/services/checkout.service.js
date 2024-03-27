const { BadRequestError } = require("../core/error.response")
const { findCartById } = require("../models/repositories/cart.repo")

class CheckoutFactory {
    static async checkoutReview({ cartId, userId,  }) {
        const foundCart = await findCartById(cartId)
        if (!foundCart) {
            throw new BadRequestError('Cart not found')
        }
        const checkout_order = {
            totalprice: 0,
            feeShip: 0,
            totalDiscount: 0,
            totalCheckout: 0
        }, shop_order_id_new = []


    }
}