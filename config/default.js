'use strict'
require('dotenv').config()

module.exports = {
  port: {
    development: process.env.DEV_APP_PORT,
    production: process.env.PRO_APP_PORT,
  },
  saltWorkFactor: 10,
  accessTokenTtl: '1d',
  refreshTokenTtl: '1y',
}
