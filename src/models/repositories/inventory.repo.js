const inventory = require("../inventory.model");

const createInventory = async ({ productId, shopId, stock }) => {
  console.log("🚀 ~ product_id:", productId);
  const newInventory = await inventory.create({
    inven_product_id: productId,
    inven_stock: stock,
    invent_shopId: shopId,
  });
  return newInventory;
};

module.exports = {
  createInventory,
};
