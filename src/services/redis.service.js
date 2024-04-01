const { getRedis } = require('../dbs/init.redis')
const { instanceConnect: redisClient } = getRedis()
const { setnx, expire } = require('../utils/redis.util')

const acquireLock = async (productId, quantity, cartId) => {
  const key = `lock_v2023_${productId}`
  const retryTimes = 10
  const expireTime = 3000

  for (let i = 0; i < retryTimes; i++) {
    const result = await setnx(key, 'lock_v2023')
    console.log(`result::`, result)

    if (result === 1) {
      const inventoryReservation = await reservationInventory({
        productId,
        quantity,
        cartId,
      })
      if (inventoryReservation.modifiedCount) {
        await expire(key, expireTime)
        return key
      }
      return null
    } else {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  }
}

const releaseLock = async (keylock) => {
  const delAsync = promisify(redisClient.del).bind(redisClient) // Use del directly, it's already promisified
  return await delAsync(keylock)
}

module.exports = {
  acquireLock,
  releaseLock,
}
