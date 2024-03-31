'use strict'
require('dotenv').config()

const env = process.env.NODE_ENV || 'development'

const config = {
  development: {
    enable: process.env.DEV_REDIS_ENABLE,
    port: process.env.DEV_REDIS_PORT,
    host: process.env.DEV_REDIS_HOST,
    username: process.env.DEV_REDIS_USERNAME,
    password: process.env.DEV_REDIS_PASSWORD,
  },
  test: {
    enable: process.env.TEST_REDIS_ENABLE,
    port: process.env.TEST_REDIS_PORT,
    host: process.env.TEST_REDIS_HOST,
    username: process.env.TEST_REDIS_USERNAME,
    password: process.env.TEST_REDIS_PASSWORD,
  },
  production: {
    enable: process.env.PRO_REDIS_ENABLE,
    port: process.env.PRO_REDIS_PORT,
    host: process.env.PRO_REDIS_HOST,
    username: process.env.PRO_REDIS_USERNAME,
    password: process.env.PRO_REDIS_PASSWORD,
  },
}

module.exports = config[env]
