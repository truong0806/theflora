const redis = require('redis')
const dotenv = require('dotenv')
dotenv.config()
const db = require('../../config/redis')
const host = db.host
const port = db.port
console.log('🚀 ~ host:', host, port)
class RedisConf {
  constructor() {
    this.connect()
  }

  connect() {
    const client = redis.createClient({
      port: port,
      host: host,
    })

    client.on('connect', () => {
      console.log(`Connected: Redis connected host ${host} port ${port}!`)
    })

    client.on('error', () => {
      console.log(`Error: Redis connected host ${host} port ${port}!`)
    })
  }

  static getInstance() {
    if (!RedisConf.instance) {
      RedisConf.instance = new RedisConf()
    }

    return RedisConf.instance
  }
}

const instanceRedis = RedisConf.getInstance()

module.exports = instanceRedis
