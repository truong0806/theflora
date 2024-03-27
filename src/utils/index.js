const _ = require("lodash")
const mongoose = require('mongoose');
const {  findProductById } = require("../services/product.service");



const isEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}


const ValidateProductBeforeAddToCart = async (products) => {
  const listProduct = [];
  for (const product of products) {
    if (!listProduct[product.shopId]) {
      listProduct[product.shopId] = {
        shopId: product.shopId,
        shop_discount: [],
        item_product: []
      };
    }

    let productDetails = await findProductById(product.productId);
    if (productDetails.product_quantity <= 0) {
      throw new Error(`${productDetails._id} is out of stock`)
    } else {
      listProduct[product.shopId].item_product.push({
        productId: product.productId,
        quantity: product.quantity,
        product_name: productDetails.product_name,
        product_price: productDetails.product_price
      });
    }

  }
  return  Object.values(listProduct)
}



module.exports = {
  ValidateProductBeforeAddToCart,
  isEmail
};
