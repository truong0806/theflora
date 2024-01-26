const { convertToObjectId, unSelectData } = require("../../utils");
const discountModel = require("../discount.model");

const findAllDiscountCode = async ({
  filter,
  limit,
  page,
  select,
  unSelect,
  model,
}) => {
  const foundDiscount = await model
    .find(filter)
    .limit(+limit)
    .skip(+page)
    .select(select ? select : unSelectData(unSelect))
    .lean();
  const count = await foundDiscount.length;
  return { count, foundDiscount };
};
const findDiscountByCode = async ( code, shopId ) => {
  const foundDiscount = await discountModel
    .findOne({
      discount_code: code,
      discount_shopId: convertToObjectId(shopId),
    })
    .lean();
  return foundDiscount;
};

const checkDiscountExists = async ({ model, filter }) => {
  const foundDiscount = await model.findOne(filter).lean();
  return foundDiscount;
};

module.exports = {
  findDiscountByCode,
  checkDiscountExists,
  findAllDiscountCode,
};
