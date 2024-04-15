const amqp = require('amqplib')

async function publishMessage() {
  const connection = await amqp.connect(
    'amqps://dexuiorb:6OPH0YyphchDUYaA-zHyOp4tfR4V8hGW@octopus.rmq3.cloudamqp.com/dexuiorb',
  )
  const channel = await connection.createChannel()

  channel.confirmPublish = true

  channel.on('return', (msg) => {
    console.error(`Tin nhắn bị trả lại: ${msg.content.toString()}`)
  })

  const message = 'Tin nhắn thử nghiệm'
  channel.publish('my-exchange', 'my-routing-key', Buffer.from(message), {
    persistent: true,
  })

  console.log('Tin nhắn đã được xuất bản')
}

publishMessage().catch((err) => {
  console.error(err)
})
