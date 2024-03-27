const { findProductById } = require("./product.repo");
const { convertToObjectId } = require("../../utils");
const cartModel = require("../cart.model");
const productModel = require("../product.model");

const findCartByUserId = (userId) => {
    return cartModel.findOne({ cart_userId: userId })
}
const findCartById = (id) => {
    return cartModel.findOne({ _id: convertToObjectId(id), cart_state: 'active' }).lean()
}
const updateCartProductQuantity = async ({ listProduct, foundCart }) => {
    const mes = [];
    for (const { shopId, item_product } of listProduct) {
        const shopIndex = foundCart.cart_products.findIndex((shop) => shop.shopId === shopId);
        if (shopIndex === -1) {
            console.error('Shop not found');
            continue;
        }

        for (const el of item_product) {
            const { productId } = el;
            const productIndex = foundCart.cart_products[shopIndex].item_product.findIndex(
                (product) => product.productId === productId
            );
            if (productIndex === -1) {
                console.error('Product not found in the cart');
                continue;
            }
            const foundProduct = await findProductById({ product_id: productId, select: ['product_quantity'] });
            const product = foundCart.cart_products[shopIndex].item_product[productIndex];
            product.quantity += el.quantity;
            if (product.quantity > foundProduct.product_quantity) {
                mes.push(`Product ${productId} out of stock`);
            }
        }
    }

    foundCart.markModified('cart_products');
    await foundCart.save();

    return mes.length > 0 ? mes : foundCart;
};
const createCart = async ({ userId, listProduct }) => {
    const query = {
        cart_userId: userId,
        cart_state: 'active',
    }
    const updateOrInsert = {
        $addToSet: { cart_products: { $each: listProduct } },
    }
    const options = { upsert: true, new: true }
    const output = await cartModel.findOneAndUpdate(query, updateOrInsert, options)
    return output
}

const createCartV2 = async ({ userId, shop_order_Id }) => {
    for (let item of shop_order_Id) {
        const { item_product } = item
        for (let product of item_product) {
            const productInDb = await findProductById({
                product_id: product.productId,
            })
            if (!productInDb) {
                throw new Error(`Product ${product.productId} not found`)
            }
            console.log(
                '🚀 ~ CartService ~ createCartV2 ~ productInDb:',
                productInDb,
            )
            if (productInDb.product_quantity < product.quantity) {
                throw new Error(
                    `Product ${product.productId} does not have enough quantity in stock.`,
                )
            }
        }
    }
    const query = {
        cart_userId: userId,
        cart_state: 'active',
    }

    const updateOrInsert = {
        $addToSet: { cart_products: { $each: shop_order_Id } },
    }

    const options = { upsert: true, new: true }
    return await cartModel.findOneAndUpdate(query, updateOrInsert, options)
}

const deleteUserCart = async (userId) => {
    const deleted = await cartModel.findOneAndDelete({
        cart_userId: userId,
        cart_state: 'active',
    })
    return deleted ? "Delete success" : "Delete failed"
}
const getUserCart = async ({ userId, select }) => {
    return await cartModel.findOne({
        cart_userId: userId,
        cart_state: 'active',
    }).select(select)
}
const updateCartProductQuantityV2 = async ({ userId, shop_order_Id }) => {
    for (let item of shop_order_Id) {
        for (let product of item.item_product) {
            const productId = product.productId
            console.log(
                '🚀 ~ CartService ~ updateCartProductQuantityV2 ~ productId:',
                productId,
            )
            const quantity = product.quantity
            const query = {
                cart_userId: userId,
                cart_state: 'active',
                'cart_products.$[].item_product.$[elem].productId': productId,
            },
                updateSet = {
                    $inc: {
                        'cart_products.$[].item_product.$[elem].quantity': quantity,
                    },
                },
                options = {
                    arrayFilters: [{ 'elem.productId': productId }],
                    new: true,
                }
            await cartModel.findOneAndUpdate(query, updateSet, options)
        }
    }
}

module.exports = {
    findCartByUserId,
    findCartById,
    updateCartProductQuantity,
    createCart,
    updateCartProductQuantityV2,
    createCartV2,
    deleteUserCart,
    getUserCart
}