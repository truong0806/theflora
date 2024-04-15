const amqp = require('amqplib')

const runProducer = async () => {
  try {
    const con = await amqp.connect(
      'amqps://dexuiorb:6OPH0YyphchDUYaA-zHyOp4tfR4V8hGW@octopus.rmq3.cloudamqp.com/dexuiorb',
    )
    const channel = await con.createChannel()
    const queue = 'order-test'
    await channel.assertQueue(queue, {
      durable: true,
    })
    for (let i = 0; i < 10; i++) {
      const msg = `msg is ${i}`
      channel.sendToQueue(queue, Buffer.from(msg), {
        persistent: true,
      })
      console.log(msg)
    }
    setTimeout(() => {
      con.close()
      process.exit(0)
    }, 1000)
  } catch (error) {
    console.error(error)
    throw error
  }
}

runProducer().catch((err) => console.log(err))
