class CheckoutFactory {
    static async checkoutReview({ cartId, userId, shopId }){
        const foundCart = await cartModel.findOne({ cart_userId: userId })
        if (!foundCart) {
            throw new Error('Cart not found')
        }
        if (foundCart.cart_products.length === 0) {
            throw new Error('Cart is empty')
        }
        const foundShop = await shopModel.findOne({ _id: shopId })
        if (!foundShop) {
            throw new Error('Shop not found')
        }
        const listProduct = await this.findProductAfterAddToCart(foundCart.cart_products)
        return await cartModel.findOneAndUpdate(
            { cart_userId: userId },
            { cart_products: listProduct },
            { new: true },
        )
    }
}