const compression = require('compression')
const createError = require('http-errors')
const express = require('express')
const { default: helmet } = require('helmet')
const rfs = require('rotating-file-stream')
const path = require('path')
const morgan = require('morgan')
const moment = require('moment')
const app = express()
const cors = require('cors')
const isProduction = process.env.NODE_ENV === 'production'

//midelware
const accessLogStream = rfs.createStream(
  `log_${moment().format('DD_MM_YYYY')}.log`,
  {
    interval: '1d', // rotate daily
    path: path.join(__dirname, 'log'),
  },
)
app.use(
  cors({
    exposedHeaders: ['X-Total-Count'],
  }),
)
app.use(
  isProduction
    ? morgan('combined', { stream: accessLogStream })
    : morgan('dev'),
)
app.use(helmet());
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// const { checkOverLoad } = require("./helpers/check.connect");
// checkOverLoad();

//database
require('./dbs/init.mongoosedb')

//routes

const initRoutes = require('./routers')
initRoutes(app)

//error handler
app.use((next) => {
  const error = new Error('Not Found')
  error.code = 404
  next(error)

})

app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: error.message || "Internal Server Error",
  });
});

module.exports = app
