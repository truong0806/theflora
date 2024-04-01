const { createClient } = require('redis')
const dotenv = require('dotenv')
dotenv.config()
const db = require('../../config/redis')
const host = db.host
const port = db.port
class RedisConf {
  constructor() {
    this.connect()
  }

  async connect() {
    const client = createClient({
      port: port,
      host: host,
    });

    client.on('connect', () => {
      console.log(`Connected: Redis connected host ${host} port ${port}!`);
    });

    client.on('error', (err) => {
      console.error(`Error: ${err}`);
    });
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
