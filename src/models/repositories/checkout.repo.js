const { checkProduct } = require("./product.repo")

const calculateTotalOrder = async (item_product) => {
  const checkProductServer = await checkProduct({
    listProduct: item_product,
  })
  if (!checkProductServer[0]) throw new BadRequestError('Something went wrong')
  const totalPrice = await checkProductServer.reduce(
    (acc, product) => acc + product.price * product.quantity,
    0,
  )
  return { totalPrice, checkProductServer }
}

module.exports = {
  calculateTotalOrder,
}
