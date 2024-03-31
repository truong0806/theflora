'use strict'

const production = {
  app: {
    port: process.env.PRO_APP_PORT,
  },
  db: {
    stringConnect: `${process.env.PRO_DB_URI}/${process.env.PRO_DB_NAME}`,
  },
  redis: {
    enable: process.env.PRO_REDIS_ENABLE,
    port: process.env.PRO_REDIS_PORT,
    host: process.env.PRO_REDIS_HOST,
    username: process.env.PRO_REDIS_USERNAME,
    password: process.env.PRO_REDIS_PASSWORD,
  },
}
const development = {
  app: {
    port: process.env.DEV_APP_PORT,
  },
  db: {
    stringConnect: `${process.env.DEV_DB_URI}/${process.env.DEV_DB_NAME}`,
  },
  redis: {
    enable: process.env.DEV_REDIS_ENABLE,
    port: process.env.DEV_REDIS_PORT,
    host: process.env.DEV_REDIS_HOST,
    username: process.env.DEV_REDIS_USERNAME,
    password: process.env.DEV_REDIS_PASSWORD,
  },
}
const config = {
  production,
  development,
}
const env = process.env.NODE_ENV || 'development'
module.exports = config[env]
