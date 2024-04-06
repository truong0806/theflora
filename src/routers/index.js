const accessRouter = require('./access')
const checkoutRouter = require('./checkout')
const orderRouter = require('./order')
const productRouter = require('./product')
const commentRouter = require('./comment')
const discountRouter = require('./discount')
const uploadRouter = require('./upload')
const notiRouter = require('./notification')
const cartRouter = require('./cart')
const { pushLogToDiscord } = require('../middleware')

const initRoutes = (app) => {
  app.use(pushLogToDiscord)
  app.use('/api/v1/discount', discountRouter)
  app.use('/api/v1/cart', cartRouter)
  app.use('/api/v1/product', productRouter)
  app.use('/api/v1/shop', accessRouter)
  app.use('/api/v1/checkout', checkoutRouter)
  app.use('/api/v1/order', orderRouter)
  app.use('/api/v1/comment', commentRouter)
  app.use('/api/v1/upload', uploadRouter)
  app.use('/api/v1/notification', notiRouter)
}

module.exports = initRoutes
