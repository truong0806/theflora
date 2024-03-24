'use strict'
require('dotenv').config()

module.exports = {
  port: {
    development: process.env.DEV_APP_PORT,
    production: process.env.PRO_APP_PORT,
  },
  database: {
    development: {
      stringConnect: `${process.env.DEV_DB_URI}/${process.env.DEV_DB_NAME}`,
    },
    production: {
      stringConnect: `${process.env.PRO_DB_URI}/${process.env.PRO_DB_NAME}`,
    },
  },
  saltWorkFactor: 10,
  accessTokenTtl: '1d',
  refreshTokenTtl: '1y',
}
