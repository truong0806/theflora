const amqp = require('amqplib')

const runConsumer = async () => {
  const con = await amqp.connect(
    'amqps://dexuiorb:6OPH0YyphchDUYaA-zHyOp4tfR4V8hGW@octopus.rmq3.cloudamqp.com/dexuiorb',
  )
  const channel = await con.createChannel()
  const queue = 'order-test'
  await channel.assertQueue(queue, {
    durable: true,
  })
  channel.prefetch(1)
  channel.consume(queue, (msg) => {
    const mess = msg.content.toString()
    setTimeout(() => {
      console.log(mess)
      channel.ack(msg)
    }, Math.random() * 1000)
  })
  console.log('Waiting for message')
}

runConsumer().catch((err) => console.log(err))
