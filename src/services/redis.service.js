const { getRedis } = require('../dbs/init.redis')
const { instanceConnect: redisClient } = getRedis()
const { set, expire } = require('../utils/redis.util')
const {
  reservationInventory,
} = require('../models/repositories/inventory.repo')

const acquireLock = async (productId, quantity, cartId) => {
  const key = `lock_v2023_${productId}`
  const retryTimes = 10
  const expireTime = 3000

  for (let i = 0; i < retryTimes; i++) {
    const result = await redisClient.set(key, expireTime, { EX: expireTime })
    console.log(`result::`, result)

    if (result === 'OK') {
      const inventoryReservation = await reservationInventory({
        productId,
        quantity,
        cartId,
      })
      if (inventoryReservation.modifiedCount) {
        await redisClient.expire(key, expireTime)
        return key
      }
      return null
    } else {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  }
}

const releaseLock = async (keylock) => {
  return await redisClient.del(keylock, function (err, response) {
    if (err) throw err
    console.log(response)
  })
}

module.exports = {
  acquireLock,
  releaseLock,
}
