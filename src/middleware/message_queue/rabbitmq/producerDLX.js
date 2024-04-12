const amqplib = require('amqplib')
const config = require('../../../configs/config')

// const log = console.log
// console.log = function () {
//   log.apply(console, [new Date()].concat(arguments))
// }

const runProducer = async () => {
  try {
    const conn = await amqplib.connect('amqp://guest:truong911@localhost')
    const channel = await conn.createChannel()

    const notificationExchange = 'notificationExchange'
    const notificationQueue = 'notificationQueueProcess'
    const notificationExchangeDLX = 'notificationExchangeDLX'
    const notificationRoutingKeyDLX = 'notificationRoutingKeyDLX'

    //1. Create Exchange
    await channel.assertExchange(notificationExchange, 'direct', {
      durable: true,
    })
    //2. Create Queue
    const queueResult = await channel.assertQueue(notificationQueue, {
      exclusive: false,
      deadLetterExchange: notificationExchangeDLX,
      deadLetterRoutingKey: notificationRoutingKeyDLX,
    })
    //3. Bind Queue to Exchange
    await channel.bindQueue(
      queueResult.queue,
      notificationExchange,
      notificationRoutingKeyDLX,
    )
    //4. Send message to Queue
    const msg = 'a new product'
    console.log(" [x] Sent %s: '%s'", 'notification', msg)
    channel.sendToQueue(queueResult.queue, Buffer.from(msg), {
      expiration: '10000',
    })
    console.log('Message sent to queue: ', msg)
  } catch (error) {
    console.log(error)
  }
}
runProducer().catch((err) => console.error(err))
