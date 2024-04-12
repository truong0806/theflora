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
const updateInventory = async (
  { productId, quantity, shopId },
  { session },
) => {
  const foundInvent = await inventory
    .findOne({
      inven_product_id: ConvertToObjectId(productId),
      invent_shopId: ConvertToObjectId(shopId),
    })
    .session(session)
  if (!foundInvent) {
    throw new BadRequestError('Update inventory in product failed')
  }
  Object.assign(foundInvent, { inven_stock: quantity })
  const updatedInvent = await foundInvent.save({ session })
  return updatedInvent
}
const updateInventoryStock = async ({ productId, stock, shopId, opts }) => {
  opts.upsert = true
  const inventoryUpdated = await inventory.findOneAndUpdate(
    {
      inven_product_id: ConvertToObjectId(productId),
      invent_shopId: ConvertToObjectId(shopId),
    },
    { inven_stock: stock },
    opts,
  )
  return inventoryUpdated
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
  updateInventoryStock,
}
