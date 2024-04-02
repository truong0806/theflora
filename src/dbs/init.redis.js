'use strict'
const redis = require('redis')

let client = {},
  statusConnectRedis = {
    CONNECT: 'connect',
    RECONNECTING: 'reconnecting',
    END: 'end',
    ERROR: 'error',
  },
  connectionTimeout
const REDIS_CONNECT_TIMEOUT = 10000,
  REDIS_CONNECT_MESSAGE = {
    code: -99,
    message: 'Redis connection error',
  }
const handleTimeoutError = () => {
  setTimeout(() => {
    throw new Error(REDIS_CONNECT_MESSAGE)
  }, REDIS_CONNECT_TIMEOUT)
}
const handleEventConnection = ({ connectionRedis }) => {
  connectionRedis.on(statusConnectRedis.CONNECT, () => {
    console.log('Redis connected')
    clearTimeout(connectionTimeout)
  })
  connectionRedis.on(statusConnectRedis.RECONNECTING, () => {
    console.log('Redis reconnecting')
    clearTimeout(connectionTimeout)
  })
  connectionRedis.on(statusConnectRedis.END, () => {
    console.log('Redis end')
    handleTimeoutError()
  })
  connectionRedis.on(statusConnectRedis.ERROR, (err) => {
    console.log('Redis error', err)
    handleTimeoutError()
  })
}
const initRedis = () => {
  const instanceRedis = redis.createClient()
  client.instanceConnect = instanceRedis
  instanceRedis.connect()
  handleEventConnection({
    connectionRedis: instanceRedis,
  })
}
const getRedis = () => client



const closeRedis = () => {
  if (client.instanceConnect) {
    client.instanceConnect.quit()
    console.log('Redis connection closed')
  }
}

module.exports = {
  initRedis,
  getRedis,
  closeRedis,
}
