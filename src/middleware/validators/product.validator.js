const Joi = require('joi'); // Example validation library

const  validateProductData= (productData) => {
  const schema = Joi.object({
    product_name: Joi.string().min(3).max(50).required(),
    product_thumb: Joi.string().uri().allow('', null), 
    product_description: Joi.string().max(500).allow('', null),
    product_price: Joi.number().min(0).required(),
    product_quantity: Joi.number().integer().min(0).required(),
    product_type: Joi.string().valid('simple', 'configurable').required(),
    product_shop: Joi.string().required(), 
    product_attributes: Joi.array().items(
      Joi.object({ 
        name: Joi.string().required(),
        value: Joi.string().required()
      })
    ),
    product_variations: Joi.when('product_type', {
      is: 'configurable',
      then: Joi.array().items(
        Joi.object({
        })
      ).required()
    })
  });

  const { error } = schema.validate(productData);
  if (error) {
    throw new Error(error.details[0].message); 
  }
}

module.exports = {
  validateProductData,
};
