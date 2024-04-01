const accessRouter = require('./access')
const checkoutRouter = require('./checkout')
const orderRouter = require('./order')
const productRouter = require('./product')
const discountRouter = require('./discount')
const cartRouter = require('./cart')

const initRoutes = (app) => {
  app.use('/api/v1/discount', discountRouter)
  app.use('/api/v1/cart', cartRouter)
  app.use('/api/v1/product', productRouter)
  app.use('/api/v1/shop', accessRouter)
  app.use('/api/v1/checkout', checkoutRouter)
  app.use('/api/v1/order', orderRouter)
}

module.exports = initRoutes
