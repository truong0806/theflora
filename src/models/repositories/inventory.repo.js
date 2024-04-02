const { ConvertToObjectId } = require('../../utils/mongoose/mongoose')
const inventory = require('../inventory.model')

const createInventory = async ({ productId, shopId, stock }) => {
  const newInventory = await inventory.create({
    inven_product_id: productId,
    inven_stock: stock,
    invent_shopId: shopId,
  })
  return newInventory
}
const updateInventory = async ({ productId, quantity, shopId }) => {
  const query = {
      inven_product_id: ConvertToObjectId(productId),
      inven_stock: { $qte: quantity },
    },
    updateSet = {
      $inc: {
        inven_stock: quantity,
      },
      options: { upsert: true, new: true },
    }
  return await inventory.updateOne(query, updateSet, options)
}
const reservationInventory = async ({ productId, quantity, cartId }) => {
  const query = {
      inven_product_id: ConvertToObjectId(productId),
      inven_stock: { $gte: quantity },
    },
    updateSet = {
      $inc: {
        inven_stock: -quantity,
      },
      $push: {
        invent_reservations: {
          cartId,
          quantity,
          createOn: new Date(),
        },
      },
    },
    options = { upsert: true, new: false }
  return await inventory.updateOne(query, updateSet, options)
}
module.exports = {
  createInventory,
  updateInventory,
  reservationInventory,
}
