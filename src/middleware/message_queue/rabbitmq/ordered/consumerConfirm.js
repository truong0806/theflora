const amqp = require('amqplib')

async function consumeMessage() {
  const connection = await await amqp.connect(
    'amqps://dexuiorb:6OPH0YyphchDUYaA-zHyOp4tfR4V8hGW@octopus.rmq3.cloudamqp.com/dexuiorb',
  )
  const channel = await connection.createChannel()

  const exchange = 'my-exchange'
  const queue = 'my-queue'
  const routingKey = 'my-routing-key'
  await channel.assertExchange(exchange, 'direct', { durable: true })
  await channel.assertQueue(queue, { durable: true })
  await channel.bindQueue(queue, exchange, routingKey)

  channel.consume(queue, (msg) => {
    if (msg !== null) {
      console.log('Tin nhắn nhận được:', msg.content.toString())
      channel.ack(msg)
    }
  })
}

consumeMessage().catch(console.error)
